
    const successWords = [
      'Yes!',
      'Correct.',
      'You got it.',
      'Nice work.',
      'Exactly.',
      'Right on.',
      'Well done.',
      'Perfect.',
      'Bingo.',
      'That’s it.',
      'Spot on.',
      'Nailed it.',
      'You’re right.',
      'Absolutely.',
      'Good job.',
      'Brilliant.',
      'Fantastic.',
      'Excellent.',
      'Bullseye.'
    ];
  
    const failWords = [
      'Nope.',
      'Sorry.',
      'Not quite.',
      'Incorrect!',
      'Wrong.',
      'That’s not it.',
      'Afraid not.',
      'Missed it.',
      'Not this time.',
      'No.',
      'Not correct.',
      'Negative.',
      'Oops.',
      'Nah.',
      'Too bad.',
      'Miss.'
    ];

    const scorePhrases = [
      'Oops! 😬',
      'Keep trying. 👍',
      'Getting closer. 🤔',
      'Not bad. 🙂',
      'Halfway there. 🏃‍♂️',
      'Looking good. 😎',
      'Well done. 👏',
      'Nice work. 🎉',
      'So close! 😮',
      'You nailed it! 🏆'
    ];
  
    export function getRandomSuccess() {
      return successWords[Math.floor(Math.random() * successWords.length)];
    }
  
    export function getRandomFail() {
      return failWords[Math.floor(Math.random() * failWords.length)];
    }

    export const getResultText = (success) => {
        return success ? getRandomSuccess() : getRandomFail();
    };

    export const getScorePhrase = (score) => {
      return scorePhrases[Math.max(score - 1, 0)];
    };

  