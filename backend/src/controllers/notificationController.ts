import { Request, Response } from 'express';
import prisma from '../db.ts';

export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    const { pushToken } = req.body;

    if (typeof pushToken !== 'string' || !pushToken.startsWith('ExponentPushToken[')) {
      res.status(400).json({ error: 'Geçersiz push token formatı.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });

    res.status(200).json({ message: 'Push token kaydedildi.' });
  } catch (error) {
    console.error('Push token kayıt hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};

export const removePushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetkilendirme hatası.' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { pushToken: null },
    });

    res.status(200).json({ message: 'Push token silindi.' });
  } catch (error) {
    console.error('Push token silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};
