import Link from 'next/link';

const QUOTES = [
  {
    detail: "A quote from the film Shawshank Redemption which started my true appreciation for words once said.",
    text: "\"Sometimes it makes me sad, though, Andy being gone. I have to remind myself that some birds aren't meant to be caged. Their feathers are just too bright and when they fly away, the part of you that knows it was a sin to lock them up does rejoice, but still, the place you live in is that much more drab and empty now that they're gone. I guess I just miss my friend.\"",
    author: "The Shawshank Redemption (Morgan Freeman)",
    link: "https://youtu.be/n45R0eF1ctc?si=Ok5HzrHWggg11-Ap&t=35"
  },
  {
    detail: "Valve's original slogan",
    text: "\"Open your mind. Open your eyes.\"",
    author: "Valve",
    link: "https://youtu.be/ayDd_aZ1P7k?si=Kpp5bHkWufE01bFA&t=170"
  },
  {
    detail: "A play on the good ol' Once a ... Always a ...",
    text: "\"Once, Always.\"",
    author: "Me"
  },
  {
    detail: "First of many quotes that stood out to me in John Wick: Chapter 4 after recently watching it again.",
    text: "\"Friendship means little when it's convenient.\"",
    author: "John Wick: Chapter 4 (Hiroyuki Sanada)",
    link: "https://youtube.com/shorts/c6h0bbX79F0?si=ETGRFxooUtN9SEbZ"
  },
  {
    detail: "Reflection and Judgement",
    text: "\"How you do anything is how you do everything.\"",
    author: "John Wick: Chapter 4 (Bill Skarsgård)",
    link: "https://youtube.com/shorts/zG5uf3OP2Xg?si=nrJRGBKMT_H73ORw"
  },
  {
    detail: "Unbeatable execution",
    text: "\"The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men...\" (Ezekiel 25:17)",
    author: "Pulp Fiction (Samuel L. Jackson)",
    link: "https://youtu.be/65HBibknLi8?si=Jvtv6xA0q6LMBanj&t=110"
  },
  {
    detail: "Kept coming back to me had to add it",
    text: "\"Rules. Without them, we'd live with the animals.\"",
    author: "John Wick: Chapter 2 (Ian McShane)",
    link: "https://youtu.be/OlPJ9i3lwAw?si=GEw8HZhV5WtMme0j&t=50"
  },
  {
    detail: "Discovered and adapted in Portal 1 but found and appreciated through means.",
    text: "\"Oh, not in cruelty, not in wrath, The Reaper came that day; An angel visited this gray path, And took the cube away.\"",
    author: "Henry Wadsworth Longfellow",
    link: "https://www.hwlongfellow.org/poems_poem.php?pid=89"
  },
  {
    detail: "Portal 1 again.",
    text: "\"The cake is a lie!\"",
    author: "Portal 1 Writers",
    link: "https://en.wikipedia.org/wiki/The_cake_is_a_lie"
  },
  {
    detail: "Always had the ideaology in my head and have found similar quotes reminding me of it strangely always through means of Anime.",
    text: "\"Success is simply a matter of luck. Ask any failure.\"",
    author: "Earl Wilson",
    link: "https://www.goodreads.com/quotes/109016-success-is-simply-a-matter-of-luck-ask-any-failure"
  },
  {
    detail: "Reminded myself of this one simply looking through my Steam Workshop",
    text: "\"Just be a rock.\"",
    author: "Stephanie Hsu",
    link: "https://youtu.be/2X1sOTg-ivg?si=SJAjUgviER-AroM_&t=42"
  },
  {
    detail: "Reminded about from fortnite, I remember attending the fortnite event too.",
    text: "\"I Have a Dream\"",
    author: "Rev. Martin Luther King Jr.",
    link: "https://www.youtube.com/watch?v=vP4iY1TtS3s"
  },
  {
    detail: "Use of Gemini AI states that the one who coined this term isn't known SO I'll say it was from Bob Marley",
    text: "\"Time shall tell.\"",
    author: "Bob Marley",
    link: "https://youtu.be/meKhfr_CjQ0?si=oP1jgtNY9ja-20xC"
  },
  {
    detail: "Something I learnt durin studies and stuck with both as an excuse as well as belief.",
    text: "\"Form Follows Function\"",
    author: "Louis Sullivan",
    link: "https://en.wikipedia.org/wiki/Louis_Sullivan"
  },
  {
    detail: "More copium of which I am addicted to. (Builds upon: \"Don't count your chickens before they hatch\")",
    text: "\"You never truly know until you do.\"",
    author: "Me"
  },
  {
    detail: "Personal Belief",
    text: "\"What has been will be again, what has been done will be done again; there is nothing new under the sun\"",
    author: "Qoheleth",
    link: "https://en.wikipedia.org/wiki/Ecclesiastes"
  },
  {
    detail: "Part of my argument towards luck",
    text: "\"Dans les champs de l'observation, le hasard ne favorise que les esprits préparés.\" (In the fields of observation, chance favors only the prepared mind.)",
    author: "Louis Pasteur",
    link: "https://www.britannica.com/biography/Louis-Pasteur"
  },
  {
    detail: "Can't remember exactly but it stuck with me",
    text: "\"Those who use 'like' too much don't really know what they're talking about.\"",
    author: "My Old Boss"
  },
  {
    detail: "Look different but really just the same thing",
    text: "\"Two sides of the same coin.\"",
    author: "Unknown"
  },
  {
    detail: "Someone asked me whats goin on BTH.",
    text: "\"There's only so many seats at the table.\"",
    author: "Me"
  },
  {
    detail: "Perspective",
    text: "\"To each their own.\"",
    author: "Cicero / Roman Principle (Suum Cuique)",
    link: "https://en.wikipedia.org/wiki/Suum_cuique"
  },
  {
    detail: "Steal a bank or steal from a house? Assets are harder to lose than numbers.",
    text: "\"Buy land, they're not making it anymore.\"",
    author: "Mark Twain",
    link: "https://en.wikipedia.org/wiki/Mark_Twain"
  },
  {
    detail: "The nature of competition.",
    text: "\"In order to win, someone must lose.\"",
    author: "Game Theory",
    link: "https://en.wikipedia.org/wiki/Zero-sum_game"
  },
  {
    detail: "I LOVE THE HUNGER GAMES",
    detailLink: "https://youtu.be/VmZccWuoBr0?si=YSHtWaCq2Df4_E4U&t=475",
    text: "\"...But there are much worse games to play.\"",
    author: "Suzanne Collins",
    link: "https://www.goodreads.com/quotes/8741597-but-one-day-i-ll-have-to-explain-about-my-nightmares"
  },
  {
    detail: "y'aight",
    text: "\"The time to repair the roof is when the sun is shining.\"",
    author: "John F. Kennedy",
    link: "https://www.brainyquote.com/quotes/john_f_kennedy_110220"
  },
  {
    detail: "Releasee the babyyyy",
    text: "\"Never not be afraid!\"",
    author: "Croods",
    link: "https://youtu.be/wmUqs_4nzeg?si=69fb34hhLMXhtcwE"
  },
  {
    detail: "",
    text: "\"He who chases two rabbits catches neither.\"",
    author: "Confucius or Russian Folklore",
    link: "https://www.goodreads.com/quotes/8688305-the-man-who-chases-two-rabbits-catches-neither"
  },
  {
    detail: "Mine, Craft",
    text: "\"Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.\"",
    author: "Mark Twain"
  },
  {
    detail: "Spend money to make money.",
    text: "\"Necesse est facere sumptum qui quaerit lucrum\"",
    author: "Titus Maccius Plautus",
    link: "https://en.wikipedia.org/wiki/Asinaria"
  },
  {
    detail: "Thank you Ariunbuyan",
    text: "\"One day or day one.\"",
    author: "Paulo Coelho",
    link: "https://www.goodreads.com/quotes/12015583-one-day-or-day-one"
  },
  {
    detail: "Why be sad when you can be happy?",
    text: "\"Happiness is the meaning and the purpose of life, the whole aim and end of human existence.\"",
    author: "Aristotle",
    link: "https://www.pursuit-of-happiness.org/history-of-happiness/aristotle/"
  },
  {
    detail: "Benji",
    text: "\"He that can have patience can have what he will.\"",
    author: "Benjamin Franklin",
    link: "https://www.goodreads.com/quotes/197890-he-who-can-have-patience-can-have-what-he-will"
  },
  {
    detail: "Denz-uhl",
    text: "\"Do what you have to do, so you can do what you want to do.\"",
    author: "Denzel Washington",
    link: "https://youtube.com/shorts/qlpXpxLi8Lg?si=40U_klkGBzD1Q1g0"
  },
  {
    detail: "For Example",
    detailLink: "https://31.media.tumblr.com/tumblr_m4cs55fdIJ1r3tcqko1_500.jpg",
    text: "\"The problem with quotations on the Internet, is that you can never be sure of their authenticity.\"",
    author: "Abraham Lincoln",
    link: "https://www.reddit.com/r/badhistory/comments/1pkdhw/the_problem_with_quotes_on_the_internet_is_that/"
  }
];

interface Quote {
  detail: string;
  detailLink?: string;
  text: string;
  author: string;
  link?: string;
}

export default function QuotesPage() {
  return (
    <div className="min-h-screen bg-[#0c1422] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-400 tracking-tight">Favorite Quotes</h1>
          <p className="text-slate-400 mt-2">The philosophy and wisdom that stuck with me.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {(QUOTES as Quote[]).map((quote, idx) => (
            <div 
              key={idx} 
              className="bg-[#172033] p-6 rounded-xl shadow-[0_8px_15px_rgba(0,0,0,0.4)] border border-white/5 flex flex-col hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-sm text-slate-400 mb-4 italic">
                {quote.detailLink ? (
                  <a 
                    href={quote.detailLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-cyan-400 hover:underline transition-colors"
                  >
                    {quote.detail}
                  </a>
                ) : (
                  quote.detail
                )}
              </div>
              <blockquote className="text-lg font-medium text-slate-200 flex-grow mb-4 leading-relaxed">
                {quote.text}
              </blockquote>
              <p className="text-cyan-400 font-bold text-sm mt-auto text-right">
                ~ {quote.link ? (
                  <a href={quote.link} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-cyan-300">
                    {quote.author}
                  </a>
                ) : (
                  quote.author
                )}
              </p>
            </div>
          ))}
        </section>

        <div className="text-center pb-12">
          <Link href="/" className="inline-block text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
            ← Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
