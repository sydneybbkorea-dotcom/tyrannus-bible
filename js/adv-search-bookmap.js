// adv-search-bookmap.js — 한글↔영어 책이름 매핑 (KJV 데이터 키 변환용)
function _advKrToEnBook(kr){
  const m={'창세기':'Genesis','출애굽기':'Exodus','레위기':'Leviticus',
    '민수기':'Numbers','신명기':'Deuteronomy','여호수아기':'Joshua',
    '사사기':'Judges','룻기':'Ruth','사무엘기상':'1Samuel',
    '사무엘기하':'2Samuel','열왕기상':'1Kings','열왕기하':'2Kings',
    '역대기상':'1Chronicles','역대기하':'2Chronicles','에스라':'Ezra',
    '느헤미야기':'Nehemiah','에스더기':'Esther','욥기':'Job',
    '시편':'Psalms','잠언':'Proverbs','전도서':'Ecclesiastes',
    '솔로몬의아가':'SongofSolomon','이사야서':'Isaiah',
    '예레미야서':'Jeremiah','예레미야애가':'Lamentations',
    '에스겔서':'Ezekiel','다니엘서':'Daniel','호세아':'Hosea',
    '요엘':'Joel','아모스':'Amos','오바댜':'Obadiah','요나':'Jonah',
    '미가':'Micah','나훔':'Nahum','하박국':'Habakkuk',
    '스바냐':'Zephaniah','학개':'Haggai','스가랴':'Zechariah',
    '말라기':'Malachi','마태복음':'Matthew','마가복음':'Mark',
    '누가복음':'Luke','요한복음':'John','사도행전':'Acts',
    '로마서':'Romans','고린도전서':'1Corinthians',
    '고린도후서':'2Corinthians','갈라디아서':'Galatians',
    '에베소서':'Ephesians','빌립보서':'Philippians',
    '골로새서':'Colossians','데살로니가전서':'1Thessalonians',
    '데살로니가후서':'2Thessalonians','디모데전서':'1Timothy',
    '디모데후서':'2Timothy','디도서':'Titus','빌레몬서':'Philemon',
    '히브리서':'Hebrews','야고보서':'James',
    '베드로전서':'1Peter','베드로후서':'2Peter',
    '요한일서':'1John','요한이서':'2John','요한삼서':'3John',
    '유다서':'Jude','요한계시록':'Revelation'};
  return m[kr]||kr;
}
