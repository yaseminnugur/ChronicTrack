import { Request, Response } from 'express';
import prisma from '../db.ts';
import { safeParseFloat, safeParseInt } from '../utils/numberUtils.ts';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        chronicConditions: true,
        isOnboarded: true,
        createdAt: true,
        onboardingData: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    const { name, weight, height, age, isSmoking, activityLevel, saltLevel, chronicConditions, diabetesType, hba1c, bloodPressureData } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(weight !== undefined && { weight: weight ? safeParseFloat(weight) : null }),
        ...(height !== undefined && { height: height ? safeParseFloat(height) : null }),
        ...(age !== undefined && { age: age ? safeParseInt(age) : null }),
        ...(isSmoking !== undefined && { isSmoking }),
        ...(activityLevel !== undefined && { activityLevel }),
        ...(saltLevel !== undefined && { saltLevel }),
        ...(chronicConditions !== undefined && {
          chronicConditions: Array.isArray(chronicConditions)
            ? chronicConditions.join(',')
            : chronicConditions,
        }),
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
        chronicConditions: true,
        isOnboarded: true,
      },
    });

    res.status(200).json({
      message: 'Profil güncellendi.',
      user: updatedUser,
    });

    // Update onboarding data if any onboarding fields are provided
    if (diabetesType !== undefined || hba1c !== undefined || bloodPressureData !== undefined) {
      await prisma.onboardingData.upsert({
        where: { userId },
        update: {
          ...(diabetesType !== undefined && { diabetesType: diabetesType || null }),
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
    }
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isOnboarded: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Kullanıcıları listeleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};
