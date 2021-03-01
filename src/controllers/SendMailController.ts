import { resolve } from "path";
import { Request, response, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";
import { AppError } from "../errors/AppError";

class SendMailController {
  async execute(req: Request, res: Response) {
    const { email, survey_id } = req.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });
    if (!user) {
      throw new AppError("User does not exists", 404);
    }

    const survey = await surveysRepository.findOne({ id: survey_id });
    if (!survey) {
      throw new AppError("Survey does not exists", 404);
    }

    let surveyUser = await surveysUsersRepository.findOne({
      where: { user_id: user.id, value: null },
    });
    if (!surveyUser) {
      surveyUser = surveysUsersRepository.create({
        user_id: user.id,
        survey_id,
      });
      await surveysUsersRepository.save(surveyUser);
    }
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: surveyUser.id,
      link: process.env.URL_MAIL,
    };

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return res.status(201).json(surveyUser);
  }
}
export { SendMailController };
