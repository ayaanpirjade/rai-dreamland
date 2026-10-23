export interface LetterParagraph {
  type: 'body' | 'signature' | 'lead'
  text: string
}

export const LETTER_PARAGRAPHS: LetterParagraph[] = [
  {
    type: 'lead',
    text: 'Happy Birthday, meri pyaari RAI! 🎂💗',
  },
  {
    type: 'body',
    text: 'Meri Darling Begum, meri Sweetheart — aaj ka din poori duniya ke liye toh bas ek date hai, par mere liye ye tumhari kahani ka sabse khoobsurat chapter hai.',
  },
  {
    type: 'body',
    text: 'Tumhari smile hamesha aise hi bani rahe. Tumhe life mein dher saari khushiyan milein, har sapna poora ho, aur har naye saal mein beautiful moments aur lovely surprises aayein.',
  },
  {
    type: 'body',
    text: 'Aur haan — tumhara Dudu, yaani Ayaan, tumhe officially yaad dilata hai ki tum duniya ki sabse adorable Bubu ho. Yeh title tumse koi nahi cheen sakta. 🧸',
  },
  {
    type: 'body',
    text: 'Aaj ka din tumhara hai, toh cake bhi tumhara, saari cuteness bhi tumhari, aur har chhota sa moment jo tumhare saath guzrega — woh meri favourite memory banne wala hai.',
  },
  {
    type: 'body',
    text: 'Tum mujhe hamesha hasati ho, tang karti ho, mazey karati ho — aur wahi cheezein mujhe tumse sabse zyada pyaar karti hain. Main toh bas itna chahta hoon ki tum hamesha khush raho.',
  },
  {
    type: 'body',
    text: 'Duniya ke liye tum RAI ho, par mere liye tum meri sabse pyaari Sweetheart ho. Ye baat koi samajh nahi sakta, par main samajhta hoon. 💗',
  },
  {
    type: 'signature',
    text: 'Tumhara Dudu — yaani Ayaan 🧸',
  },
]

export const LETTER_COPY_TEXT = `Happy Birthday, meri pyaari RAI! 🎂💗

Meri Darling Begum, meri Sweetheart — aaj ka din poori duniya ke liye toh bas ek date hai, par mere liye ye tumhari kahani ka sabse khoobsurat chapter hai.

Tumhari smile hamesha aise hi bani rahe. Tumhe life mein dher saari khushiyan milein, har sapna poora ho, aur har naye saal mein beautiful moments aur lovely surprises aayein.

Aur haan — tumhara Dudu, yaani Ayaan, tumhe officially yaad dilata hai ki tum duniya ki sabse adorable Bubu ho. 🧸

Aaj ka din tumhara hai, toh cake bhi tumhara, saari cuteness bhi tumhari.

Duniya ke liye tum RAI ho, par mere liye tum meri sabse pyaari Sweetheart ho. 💗

Tumhara Dudu — yaani Ayaan`
