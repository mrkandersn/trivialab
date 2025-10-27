export interface Question {
  id: number;
  question: string;
  answers: Array<string>;
  correctAnswer: number;
  description: string;
}