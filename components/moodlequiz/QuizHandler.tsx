import { MultichoiceAnswer, MultichoiceQuestion } from "../../types";

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

interface QuizType {
    type: string;
    pageName: string;
}

export class QuizHandler {
    private quizTypeList: QuizType[] = [{type: "essay", pageName: "Essay"}, {type: "multichoice", pageName: "Multichoice"}];
    private parsedQuizList: any[] = [];

    private static ParseQuiz(quiz: MoodleQuiz): any[] {

    // TODO find an html parser that works and use it
    //

        const questions: MultichoiceQuestion[] = [];
        if (quiz.type === "multichoice") {
            const html = quiz.html.split("<script")[0];

            const questionSplit = html.split("qtext");
            for (let i = 1; i < questionSplit.length; i++) {
                const values = questionSplit[i].split("value=");
                const answers = questionSplit[i].split("</span>");
                const answerArray: MultichoiceAnswer[] = [];
                for (let x = 1; x < answers.length; x++) {
                    const answer: MultichoiceAnswer = {
                        name : answers[x].split("</label>")[0],
                        value : values[x].split(" id")[0].replace(/\D/g, ""),
                    }
                    answerArray.push(answer);
                }

                const questionObj: MultichoiceQuestion = {
                    title : questionSplit[i].split("</p>")[0].replace(/>|<p>|"|<br>/gi, ""),
                    answers : answerArray,
                }
                questions.push(questionObj);
            }
            return (questions);
        }
        else if (quiz.type === "essay") {
            // console.warn("Found an essay quiz")
        }
        else {
            // console.warn("Unsupported Quiz")
        }
        return questions;
    }

    public getQuizObject(quizes: MoodleQuiz[]) {
        quizes.forEach((quiz) => {
            this.parsedQuizList.push(QuizHandler.ParseQuiz(quiz));
        });
        return this.parsedQuizList; // Only returns the first quiz for testing
    }
}
