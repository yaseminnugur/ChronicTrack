import { Request, Response } from 'express';
import { getOrGenerateAnalysis } from '../services/aiAnalysisService.ts';
import type { AnalysisType } from '../services/analyzers/types.ts';

async function handle(req: Request, res: Response, type: AnalysisType, force: boolean) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Yetki reddedildi' });
      return;
    }

    const result = await getOrGenerateAnalysis(userId, type, { force });
    res.status(200).json(result);
  } catch (error: any) {
    console.error(`AI analiz hatası (${type}):`, error);
    const msg = error?.message?.includes('OPENAI_API_KEY')
      ? 'AI servisi yapılandırılmamış. Lütfen sistem yöneticisine başvurun.'
      : 'Analiz oluşturulurken bir hata oluştu.';
    res.status(500).json({ error: msg });
  }
}

export const getBloodSugarAnalysis = (req: Request, res: Response) =>
  handle(req, res, 'BLOOD_SUGAR', false);

export const getBloodPressureAnalysis = (req: Request, res: Response) =>
  handle(req, res, 'BLOOD_PRESSURE', false);

export const refreshBloodSugarAnalysis = (req: Request, res: Response) =>
  handle(req, res, 'BLOOD_SUGAR', true);

export const refreshBloodPressureAnalysis = (req: Request, res: Response) =>
  handle(req, res, 'BLOOD_PRESSURE', true);
