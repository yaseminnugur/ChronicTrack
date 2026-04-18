import { Request, Response } from 'express';
import prisma from '../db.ts';

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
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
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
  } catch (error) {
    console.error('Onboarding tamamlama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};
