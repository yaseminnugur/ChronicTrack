import { Request, Response } from 'express';
import prisma from '../db.ts';
import { safeParseFloat, safeParseInt, isValidNumber } from '../utils/numberUtils.ts';
import { validateBloodSugarInput, validateBloodPressureInput } from '../utils/healthValidation.ts';

export const addBloodSugar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetki reddedildi' });
      return;
    }
    const { glucose, mealState, notes } = req.body;

    if (!glucose || !isValidNumber(glucose)) {
      res.status(400).json({ error: 'Geçerli bir glikoz değeri girin.' });
      return;
    }

    // Min/max validasyon (medikal referanslara göre)
    const validation = validateBloodSugarInput(glucose);
    if (!validation.isValid) {
      res.status(400).json({
        error: validation.errors[0].message,
        validationErrors: validation.errors,
      });
      return;
    }

    const record = await prisma.bloodSugar.create({
      data: {
        userId,
        glucose: safeParseFloat(glucose),
        mealState: mealState || 'Belirtilmedi',
        notes: notes || '',
      }
    });

    res.status(201).json({ message: 'Kan şekeri eklendi', record });
  } catch (error) {
    console.error('addBloodSugar error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Tansiyon Ekle
export const addBloodPressure = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetki reddedildi' });
      return;
    }

    const { systolic, diastolic, pulse, notes } = req.body;

    if (!systolic || !diastolic) {
      res.status(400).json({ error: 'Sistolik ve diyastolik değerleri zorunludur.' });
      return;
    }

    // Min/max validasyon (medikal referanslara göre)
    const validation = validateBloodPressureInput(systolic, diastolic, pulse);
    if (!validation.isValid) {
      res.status(400).json({
        error: validation.errors[0].message,
        validationErrors: validation.errors,
      });
      return;
    }

    const record = await prisma.bloodPressure.create({
      data: {
        userId,
        systolic: safeParseInt(systolic),
        diastolic: safeParseInt(diastolic),
        pulse: pulse ? safeParseInt(pulse) : 0,
        notes: notes || '',
      }
    });

    res.status(201).json({ message: 'Tansiyon eklendi', record });
  } catch (error) {
    console.error('addBloodPressure error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetki reddedildi' });
      return;
    }

    const daysStr = req.query.days as string;
    const days = daysStr ? parseInt(daysStr) : 7;

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereClause = {
      userId,
      measuredAt: { gte: startDate }
    };

    const rawRecentSugars = await prisma.bloodSugar.findMany({
      where: whereClause,
      orderBy: { measuredAt: 'asc' }
    });

    const rawRecentPressures = await prisma.bloodPressure.findMany({
      where: whereClause,
      orderBy: { measuredAt: 'asc' }
    });

    const latestBloodSugar = await prisma.bloodSugar.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' }
    });

    const latestBloodPressure = await prisma.bloodPressure.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' }
    });

    res.status(200).json({
      latestBloodSugar,
      latestBloodPressure,
      recentBloodSugars: rawRecentSugars,
      recentBloodPressures: rawRecentPressures,
    });
  } catch (error) {
    console.error('getDashboardData error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

export const getBloodSugars = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetki reddedildi' });
      return;
    }
    const records = await prisma.bloodSugar.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

export const getBloodPressures = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetki reddedildi' });
      return;
    }
    const records = await prisma.bloodPressure.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
