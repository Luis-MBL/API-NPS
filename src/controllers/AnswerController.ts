import { Request, response, Response } from "express";
import { getCustomRepository } from "typeorm";
import { ReadStream } from "typeorm/platform/PlatformTools";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class AnswerController {
  async execute(req: Request, res: Response) {
    const { value } = req.params;
    const { u } = req.query;
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
    const surveyUser = await surveysUsersRepository.findOne(u.toString());

    if (!surveyUser) {
      throw new AppError("Survey User does not exists!", 404);
    }

    surveyUser.value = +value;

    await surveysUsersRepository.save(surveyUser);

    return res.json(surveyUser);
  }
}

export { AnswerController };
