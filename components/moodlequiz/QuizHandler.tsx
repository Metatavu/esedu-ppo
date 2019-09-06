import { MultichoiceAnswer, MultichoiceQuestion } from "../../types";

/**
 * Moodle quiz interface
 */
interface MoodleQuiz {
  slot: number,
  type: string,
  page: number,
  html: string,
  sequencecheck: number,
  lastactiontime: number,
  hasautosavedstep: string,
  flagged: string,
  number: number,
  status: string,
  blockedbyprevious: string,
  maxmark: number
}

/**
 * Class for parsing moodle quizes
 */
export class QuizHandler {

  /**
   * Returns an array of moodle quizes
   * 
   * @param quizes 
   */
  public getQuizObject(quizes: MoodleQuiz[]) {
    const parsedQuizList: any[] = [];
    quizes.forEach((quiz) => {
        parsedQuizList.push(this.ParseQuiz(quiz));
    });
    return parsedQuizList;
  }

  /**
   * Parses the quiz and returns it in a MultichoiceQuestion object 
   * @param quiz 
   */
  private ParseQuiz(quiz: MoodleQuiz) {
  // TODO find an html parser that works and use it
  //
    if (quiz.type === "multichoice") {
      const html = quiz.html.split("<script")[0];
      const questionSplit = html.split("qtext");
      const values = questionSplit[1].split("value=");
      const answers = questionSplit[1].split("</span>");
      const answerArray: MultichoiceAnswer[] = [];
      for (let x = 1; x < answers.length; x++) {
        const answer: MultichoiceAnswer = {
            name : answers[x].split("</label>")[0],
            value : Number.parseInt(values[x].split(" id")[0].replace(/\D/g, ""), 10)
        }
        answerArray.push(answer);
      }

      const questionObj: MultichoiceQuestion = {
          title: questionSplit[1].split("</")[0].replace(/>|<p>|"|<br>/gi, ""),
          exportCode: unescape(questionSplit[1].split("name=")[1].split(" value")[0].replace(/>|<p>|"|<br>/gi, "")),
          answers: answerArray,
          sequencecheck: quiz.sequencecheck
      }
      return (questionObj);
    }
    else {
        throw new Error("Unsupported quiz type");
    }
  }
}
