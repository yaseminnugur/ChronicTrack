import { Request, Response } from 'express';
import prisma from '../db.ts';
import { safeParseFloat, safeParseInt } from '../utils/numberUtils.ts';
import { validateHbA1cInput, validateBloodPressureInput } from '../utils/healthValidation.ts';
import { getOrGenerateAnalysis } from '../services/aiAnalysisService.ts';

export const saveProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    const { weight, height, age, isSmoking, activityLevel, saltLevel } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        weight: weight ? safeParseFloat(weight) : null,
        height: height ? safeParseFloat(height) : null,
        age: age ? safeParseInt(age) : null,
        isSmoking: isSmoking ?? false,
        activityLevel: activityLevel || null,
        saltLevel: saltLevel || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        weight: true,
        height: true,
        age: true,
        isSmoking: true,
        activityLevel: true,
        saltLevel: true,
        isOnboarded: true,
      },
    });

    res.status(200).json({
      message: 'Profil bilgileri kaydedildi.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profil kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};

export const saveConditionsAndComplete = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    const { chronicConditions } = req.body;

    const conditionsStr = Array.isArray(chronicConditions)
      ? chronicConditions.join(',')
      : (chronicConditions || 'Hiçbiri');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        chronicConditions: conditionsStr,
        isOnboarded: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isOnboarded: true,
        chronicConditions: true,
      },
    });

    res.status(200).json({
      message: 'Onboarding tamamlandı.',
      user: updatedUser,
    });

    // Fire-and-forget: kullanıcı ana ekrana geçerken arka planda ilk analizleri üret.
    // Yeterli veri yoksa (örn. hiç kan şekeri ölçümü yoksa) orchestrator AI çağırmaz,
    // boş narrative kaydedilir; kullanıcı ölçüm girdikçe gerçek analize geçilir.
    triggerInitialAnalyses(userId);
  } catch (error) {
    console.error('Onboarding tamamlama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};

function triggerInitialAnalyses(userId: string): void {
  Promise.allSettled([
    getOrGenerateAnalysis(userId, 'BLOOD_SUGAR'),
    getOrGenerateAnalysis(userId, 'BLOOD_PRESSURE'),
  ])
    .then((results) => {
      results.forEach((r, i) => {
        const type = i === 0 ? 'BLOOD_SUGAR' : 'BLOOD_PRESSURE';
        if (r.status === 'rejected') {
          console.error(`İlk ${type} analizi başarısız:`, r.reason);
        } else {
          console.log(`İlk ${type} analizi üretildi (cache=${r.value.fromCache})`);
        }
      });
    });
}

export const saveOnboardingData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    const { diabetesType, hba1c, bloodPressureData } = req.body;

    // HbA1c validasyonu (medikal referanslara göre)
    if (hba1c) {
      const hba1cValidation = validateHbA1cInput(hba1c);
      if (!hba1cValidation.isValid) {
        res.status(400).json({
          error: hba1cValidation.errors[0].message,
          validationErrors: hba1cValidation.errors,
        });
        return;
      }
    }

    // Tansiyon setleri validasyonu (medikal referanslara göre)
    if (bloodPressureData && Array.isArray(bloodPressureData)) {
      for (let i = 0; i < bloodPressureData.length; i++) {
        const set = bloodPressureData[i];
        const bpValidation = validateBloodPressureInput(set.sis, set.dia, set.pulse);
        if (!bpValidation.isValid) {
          res.status(400).json({
            error: `Set ${i + 1}: ${bpValidation.errors[0].message}`,
            validationErrors: bpValidation.errors,
          });
          return;
        }
      }
    }

    const onboardingData = await prisma.onboardingData.upsert({
      where: { userId },
      update: {
        ...(diabetesType !== undefined && { diabetesType }),
        ...(hba1c !== undefined && { hba1c: hba1c ? safeParseFloat(hba1c) : null }),
        ...(bloodPressureData !== undefined && { bloodPressureData }),
      },
      create: {
        userId,
        diabetesType: diabetesType || null,
        hba1c: hba1c ? safeParseFloat(hba1c) : null,
        bloodPressureData: bloodPressureData || null,
      },
    });

    res.status(200).json({
      message: 'Onboarding verisi kaydedildi.',
      onboardingData,
    });
  } catch (error) {
    console.error('Onboarding veri kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};
