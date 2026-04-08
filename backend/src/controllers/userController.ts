import { Request, Response } from 'express';
import prisma from '../db.ts';

// Yeni Kullanıcı Oluştur (POST /api/users)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    // Basit doğrulama (Validation)
    if (!email) {
      res.status(400).json({ error: 'Email alanı zorunludur.' });
      return;
    }

    // Veritabanında (DB) bu email zaten var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Bu email adresi zaten kullanılıyor.' });
      return;
    }

    // Prisma ile DB'ye yeni kaydı at
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu!',
      user: newUser
    });

  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};

// Tüm Kullanıcıları Getir (GET /api/users) - İsteğe Bağlı Kontrol İçin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Kullanıcıları listeleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası meydana geldi.' });
  }
};
