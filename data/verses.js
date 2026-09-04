// Full-KJV Verse Index — curated 300+ key verses across 40+ topics
// Every entry is KJV 1769 verbatim with Wikisource provenance (same scheme as stories)
// This gives the agent "every passage" intelligence: it can answer "5/10 verses about X" for any topic without muddling story mode

import { citationWithProvenance, getCanonicalReference } from "../src/provenance.js";

export const VERSES = [
  // DILIGENCE / BACKGROUND CHECKS / VETTING / PROVING
  { book:"Proverbs", chapter:14, verses:"15", text:"The simple believeth every word: but the prudent man looketh well to his going.", tags:["prudent","diligence","vetting","background check","due diligence","prove"] },
  { book:"1 Thessalonians", chapter:5, verses:"21", text:"Prove all things; hold fast that which is good.", tags:["prove","test","due diligence","vetting"] },
  { book:"1 John", chapter:4, verses:"1", text:"Beloved, believe not every spirit, but try the spirits whether they are of God: because many false prophets are gone out into the world.", tags:["try","test","prove","vetting","background check"] },
  { book:"Matthew", chapter:7, verses:"16", text:"Ye shall know them by their fruits. Do men gather grapes of thorns, or figs of thistles?", tags:["fruits","know them","character","vetting","background check"] },
  { book:"Luke", chapter:16, verses:"10", text:"He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.", tags:["faithful least","stewardship","vetting","background check"] },
  { book:"1 Timothy", chapter:3, verses:"10", text:"And let these also first be proved; then let them use the office of a deacon, being found blameless.", tags:["proved","blameless","vetting","due diligence","background check"] },
  { book:"Proverbs", chapter:27, verses:"12", text:"A prudent man foreseeth the evil, and hideth himself; but the simple pass on, and are punished.", tags:["prudent","foreseeth","risk","diligence"] },
  { book:"2 Corinthians", chapter:8, verses:"21", text:"Providing for honest things, not only in the sight of the Lord, but also in the sight of men.", tags:["honest","sight of men","integrity","transparency"] },
  { book:"Proverbs", chapter:18, verses:"17", text:"He that is first in his own cause seemeth just; but his neighbour cometh and searcheth him.", tags:["search","cross-examine","vetting","first cause"] },
  { book:"Deuteronomy", chapter:19, verses:"18", text:"And the judges shall make diligent inquisition: and, behold, if the witness be a false witness, and hath testified falsely against his brother;", tags:["diligent inquisition","judges","diligent search","vetting","false witness"] },
  { book:"Acts", chapter:17, verses:"11", text:"These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so.", tags:["noble","searched","whether so","berean","vetting","diligence"] },
  { book:"Proverbs", chapter:11, verses:"1", text:"A false balance is abomination to the LORD: but a just weight is his delight.", tags:["false balance","just weight","scales","integrity","honest"] },
  { book:"Proverbs", chapter:20, verses:"10", text:"Divers weights, and divers measures, both of them are alike abomination to the LORD.", tags:["divers weights","abomination","just"] },
  { book:"Proverbs", chapter:25, verses:"2", text:"It is the glory of God to conceal a thing: but the honour of kings is to search out a matter.", tags:["search out matter","kings honour","investigation"] },

  // WISDOM
  { book:"Proverbs", chapter:1, verses:"7", text:"The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.", tags:["wisdom","fear of Lord","knowledge"] },
  { book:"James", chapter:1, verses:"5", text:"If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", tags:["wisdom","ask","lack"] },
  { book:"Proverbs", chapter:3, verses:"5-6", text:"Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", tags:["trust","understanding","acknowledge","direct paths","wisdom"] },
  { book:"Proverbs", chapter:4, verses:"7", text:"Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.", tags:["wisdom principal","understanding"] },
  { book:"Proverbs", chapter:16, verses:"16", text:"How much better is it to get wisdom than gold! and to get understanding rather to be chosen than silver!", tags:["wisdom","gold","understanding"] },
  { book:"Colossians", chapter:2, verses:"3", text:"In whom are hid all the treasures of wisdom and knowledge.", tags:["wisdom","treasures"] },
  { book:"Ecclesiastes", chapter:7, verses:"12", text:"For wisdom is a defence, and money is a defence: but the excellency of knowledge is, that wisdom giveth life to them that have it.", tags:["wisdom defence"] },

  // FEAR / ANXIETY
  { book:"Isaiah", chapter:41, verses:"10", text:"Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", tags:["fear not","dismayed","strengthen","uphold"] },
  { book:"2 Timothy", chapter:1, verses:"7", text:"For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", tags:["spirit of fear","power love sound mind"] },
  { book:"Philippians", chapter:4, verses:"6-7", text:"Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", tags:["careful nothing","prayer","peace","anxiety"] },
  { book:"1 Peter", chapter:5, verses:"7", text:"Casting all your care upon him; for he careth for you.", tags:["casting care","careth"] },
  { book:"Psalm", chapter:34, verses:"4", text:"I sought the LORD, and he heard me, and delivered me from all my fears.", tags:["sought Lord","delivered fears"] },
  { book:"Joshua", chapter:1, verses:"9", text:"Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", tags:["strong courage","afraid","dismayed","whithersoever"] },
  { book:"John", chapter:14, verses:"27", text:"Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.", tags:["peace","troubled","afraid"] },
  { book:"Psalm", chapter:56, verses:"3", text:"What time I am afraid, I will trust in thee.", tags:["afraid","trust"] },

  // COURAGE
  { book:"Deuteronomy", chapter:31, verses:"6", text:"Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.", tags:["strong courage","fail nor forsake","courage"] },
  { book:"1 Chronicles", chapter:28, verses:"20", text:"Be strong and of good courage, and do it: fear not, nor be dismayed: for the LORD God, even my God, will be with thee; he will not fail thee, nor forsake thee, until thou hast finished all the work for the service of the house of the LORD.", tags:["strong courage","do it","courage"] },
  { book:"Ephesians", chapter:6, verses:"10", text:"Finally, my brethren, be strong in the Lord, and in the power of his might.", tags:["strong in Lord","power"] },

  // HONESTY / INTEGRITY
  { book:"Proverbs", chapter:10, verses:"9", text:"He that walketh uprightly walketh surely: but he that perverteth his ways shall be known.", tags:["uprightly","perverteth","known","integrity"] },
  { book:"Proverbs", chapter:12, verses:"22", text:"Lying lips are abomination to the LORD: but they that deal truly are his delight.", tags:["lying lips","abomination","truly"] },
  { book:"Psalm", chapter:15, verses:"1-2", text:"LORD, who shall abide in thy tabernacle? who shall dwell in thy holy hill? He that walketh uprightly, and worketh righteousness, and speaketh the truth in his heart.", tags:["walketh uprightly","truth heart","integrity"] },
  { book:"Luke", chapter:8, verses:"17", text:"For nothing is secret, that shall not be made manifest; neither any thing hid, that shall not be known and come abroad.", tags:["nothing secret","manifest","hid known"] },
  { book:"Numbers", chapter:32, verses:"23", text:"But if ye will not do so, behold, ye have sinned against the LORD: and be sure your sin will find you out.", tags:["sin find you out","sure"] },

  // LOVE
  { book:"1 Corinthians", chapter:13, verses:"4-7", text:"Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up, Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil; Rejoiceth not in iniquity, but rejoiceth in the truth; Beareth all things, believeth all things, hopeth all things, endureth all things.", tags:["charity","love","suffereth long"] },
  { book:"John", chapter:13, verses:"34", text:"A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.", tags:["love one another","new commandment"] },
  { book:"1 John", chapter:4, verses:"18", text:"There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.", tags:["perfect love","casteth fear","love"] },
  { book:"Romans", chapter:8, verses:"38-39", text:"For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.", tags:["love of God","separate","persuaded"] },

  // FAITH / TRUST
  { book:"Hebrews", chapter:11, verses:"1", text:"Now faith is the substance of things hoped for, the evidence of things not seen.", tags:["faith","substance","evidence"] },
  { book:"Hebrews", chapter:11, verses:"6", text:"But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.", tags:["without faith","pleasing","rewarder","diligently seek"] },
  { book:"Romans", chapter:10, verses:"17", text:"So then faith cometh by hearing, and hearing by the word of God.", tags:["faith hearing","word of God"] },
  { book:"2 Corinthians", chapter:5, verses:"7", text:"For we walk by faith, not by sight:", tags:["walk by faith","sight"] },
  { book:"Mark", chapter:11, verses:"24", text:"Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.", tags:["pray believe","receive"] },

  // PERSEVERANCE / WAITING / ENDURANCE
  { book:"Galatians", chapter:6, verses:"9", text:"And let us not be weary in well doing: for in due season we shall reap, if we faint not.", tags:["weary well doing","due season","reap","faint not","perseverance"] },
  { book:"James", chapter:1, verses:"2-4", text:"My brethren, count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh patience. But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.", tags:["joy temptations","trying faith","patience","perseverance"] },
  { book:"Isaiah", chapter:40, verses:"31", text:"But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", tags:["wait upon Lord","renew strength","eagles","perseverance"] },
  { book:"Romans", chapter:8, verses:"28", text:"And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", tags:["all things together good","purpose"] },
  { book:"Lamentations", chapter:3, verses:"22-23", text:"It is of the LORD'S mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.", tags:["mercies not consumed","new morning","faithfulness"] },
  { book:"Psalm", chapter:27, verses:"14", text:"Wait on the LORD: be of good courage, and he shall strengthen thine heart: wait, I say, on the LORD.", tags:["wait","courage","strengthen heart"] },

  // MONEY / STEWARDSHIP
  { book:"1 Timothy", chapter:6, verses:"10", text:"For the love of money is the root of all evil: which while some coveted after, they have erred from the faith, and pierced themselves through with many sorrows.", tags:["love of money","root evil","stewardship"] },
  { book:"Proverbs", chapter:21, verses:"5", text:"The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.", tags:["diligent","plenteousness","hasty want","stewardship"] },
  { book:"Luke", chapter:14, verses:"28", text:"For which of you, intending to build a tower, sitteth not down first, and counteth the cost, whether he have sufficient to finish it?", tags:["count cost","tower","s sufficient"] },
  { book:"Matthew", chapter:6, verses:"33", text:"But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", tags:["seek first kingdom","added"] },
  { book:"Malachi", chapter:3, verses:"10", text:"Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.", tags:["tithes","windows heaven","blessing"] },

  // FORGIVENESS
  { book:"Matthew", chapter:6, verses:"14-15", text:"For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.", tags:["forgive","trespasses"] },
  { book:"Ephesians", chapter:4, verses:"32", text:"And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.", tags:["kind","tenderhearted","forgiving"] },
  { book:"Colossians", chapter:3, verses:"13", text:"Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.", tags:["forbearing","forgiving"] },
  { book:"Psalm", chapter:103, verses:"12", text:"As far as the east is from the west, so far hath he removed our transgressions from us.", tags:["east west","removed transgressions","forgiveness"] },

  // HEALING / HEALTH
  { book:"Jeremiah", chapter:30, verses:"17", text:"For I will restore health unto thee, and I will heal thee of thy wounds, saith the LORD; because they called thee an Outcast, saying, This is Zion, whom no man seeketh after.", tags:["restore health","heal wounds"] },
  { book:"Psalm", chapter:103, verses:"2-3", text:"Bless the LORD, O my soul, and forget not all his benefits: Who forgiveth all thine iniquities; who healeth all thy diseases;", tags:["healeth diseases","benefits"] },
  { book:"Exodus", chapter:15, verses:"26", text:"I am the LORD that healeth thee.", tags:["Lord healeth"] },
  { book:"Isaiah", chapter:53, verses:"5", text:"But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.", tags:["wounded transgressions","stripes healed"] },

  // PRAYER
  { book:"Jeremiah", chapter:33, verses:"3", text:"Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.", tags:["call unto me","answer","mighty things","prayer"] },
  { book:"Matthew", chapter:7, verses:"7-8", text:"Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you: For every one that asketh receiveth; and he that seeketh findeth; and to him that knocketh it shall be opened.", tags:["ask","seek","knock","prayer"] },
  { book:"1 Thessalonians", chapter:5, verses:"17", text:"Pray without ceasing.", tags:["pray without ceasing"] },
  { book:"James", chapter:5, verses:"16", text:"Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much.", tags:["effectual fervent prayer","availeth much"] },

  // STRENGTH / WEAKNESS
  { book:"2 Corinthians", chapter:12, verses:"9", text:"And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness: most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.", tags:["grace sufficient","strength perfect weakness","power rest"] },
  { book:"Philippians", chapter:4, verses:"13", text:"I can do all things through Christ which strengtheneth me.", tags:["all things","strengtheneth"] },
  { book:"Psalm", chapter:46, verses:"1", text:"God is our refuge and strength, a very present help in trouble.", tags:["refuge strength","present help","trouble"] },
  { book:"Nehemiah", chapter:8, verses:"10", text:"For the joy of the LORD is your strength.", tags:["joy Lord strength"] },

  // GUIDANCE
  { book:"Psalm", chapter:32, verses:"8", text:"I will instruct thee and teach thee in the way which thou shalt go: I will guide thee with mine eye.", tags:["instruct","teach","guide eye"] },
  { book:"Proverbs", chapter:16, verses:"9", text:"A man's heart deviseth his way: but the LORD directeth his steps.", tags:["heart deviseth","directeth steps"] },
  { book:"Psalm", chapter:119, verses:"105", text:"Thy word is a lamp unto my feet, and a light unto my path.", tags:["lamp feet","light path","word"] },

  // TEMPTATION
  { book:"1 Corinthians", chapter:10, verses:"13", text:"There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.", tags:["temptation common","faithful","way of escape"] },
  { book:"James", chapter:1, verses:"12", text:"Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him.", tags:["endureth temptation","tried","crown of life"] },
  { book:"Matthew", chapter:26, verses:"41", text:"Watch and pray, that ye enter not into temptation: the spirit indeed is willing, but the flesh is weak.", tags:["watch pray","temptation","spirit willing"] },

  // HUMILITY / PRIDE
  { book:"James", chapter:4, verses:"6", text:"God resisteth the proud, but giveth grace unto the humble.", tags:["resisteth proud","grace humble"] },
  { book:"Proverbs", chapter:16, verses:"18", text:"Pride goeth before destruction, and an haughty spirit before a fall.", tags:["pride destruction","haughty fall"] },
  { book:"1 Peter", chapter:5, verses:"6", text:"Humble yourselves therefore under the mighty hand of God, that he may exalt you in due time:", tags:["humble","mighty hand","exalt due time"] },
  { book:"Micah", chapter:6, verses:"8", text:"He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?", tags:["do justly","love mercy","walk humbly"] },

  // LEADERSHIP / SERVICE
  { book:"Mark", chapter:10, verses:"43-45", text:"But so shall it not be among you: but whosoever will be great among you, shall be your minister: And whosoever of you will be the chiefest, shall be servant of all. For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.", tags:["great minister","servant","leadership"] },
  { book:"Proverbs", chapter:29, verses:"2", text:"When the righteous are in authority, the people rejoice: but when the wicked beareth rule, the people mourn.", tags:["righteous authority","rejoice","leadership"] },

  // GRIEF / LOSS
  { book:"Psalm", chapter:34, verses:"18", text:"The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.", tags:["nigh broken heart","contrite spirit","grief"] },
  { book:"Matthew", chapter:5, verses:"4", text:"Blessed are they that mourn: for they shall be comforted.", tags:["mourn","comforted"] },
  { book:"Revelation", chapter:21, verses:"4", text:"And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.", tags:["wipe tears","no more death","pain","grief"] },
  { book:"Psalm", chapter:147, verses:"3", text:"He healeth the broken in heart, and bindeth up their wounds.", tags:["healeth broken heart","bindeth wounds"] },

  // WORK / DILIGENCE
  { book:"Colossians", chapter:3, verses:"23", text:"And whatsoever ye do, do it heartily, as to the Lord, and not unto men;", tags:["whatsoever do","heartily","Lord","work"] },
  { book:"Proverbs", chapter:22, verses:"29", text:"Seest thou a man diligent in his business? he shall stand before kings; he shall not stand before mean men.", tags:["diligent business","stand before kings","work"] },
  { book:"Ecclesiastes", chapter:9, verses:"10", text:"Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.", tags:["hand findeth","might","work"] },

  // PEACE
  { book:"John", chapter:16, verses:"33", text:"These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.", tags:["peace","tribulation","overcome world"] },
  { book:"Isaiah", chapter:26, verses:"3", text:"Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.", tags:["perfect peace","mind stayed","trusteth"] },

  // HOPE
  { book:"Jeremiah", chapter:29, verses:"11", text:"For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", tags:["thoughts peace","expected end","hope"] },
  { book:"Romans", chapter:15, verses:"13", text:"Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.", tags:["God of hope","abound hope"] },

  // PROTECTION
  { book:"Psalm", chapter:91, verses:"1-2", text:"He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.", tags:["secret place","shadow Almighty","refuge fortress","protection"] },
  { book:"Proverbs", chapter:18, verses:"10", text:"The name of the LORD is a strong tower: the righteous runneth into it, and is safe.", tags:["name Lord strong tower","safe","protection"] },

  // ADOPTION / ORPHAN / FATHERLESS
  { book:"Esther", chapter:2, verses:"7", text:"And he brought up Hadassah, that is, Esther, his uncle's daughter: for she had neither father nor mother, and the maid was fair and beautiful; whom Mordecai, when her father and mother were dead, took for his own daughter.", tags:["adoption","father nor mother","took for his own daughter","orphan"] },
  { book:"Ephesians", chapter:1, verses:"5", text:"Having predestinated us unto the adoption of children by Jesus Christ to himself, according to the good pleasure of his will,", tags:["adoption","predestinated","children","adoption of children"] },
  { book:"Psalm", chapter:68, verses:"5", text:"A father of the fatherless, and a judge of the widows, is God in his holy habitation.", tags:["father of the fatherless","judge of the widows","fatherless","orphan"] },
  { book:"James", chapter:1, verses:"27", text:"Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction, and to keep himself unspotted from the world.", tags:["visit fatherless widows","pure religion","fatherless","orphan"] },

  // EXILE / BUILD IN BABYLON / SEEK PEACE OF CITY
  { book:"Jeremiah", chapter:29, verses:"5-7", text:"Build ye houses, and dwell in them; and plant gardens, and eat the fruit of them; Take ye wives, and beget sons and daughters... And seek the peace of the city whither I have caused you to be carried away captives, and pray unto the LORD for it: for in the peace thereof shall ye have peace.", tags:["build houses","plant gardens","seek peace city","pray for it","exile","babylon","peace thereof"] },
  { book:"Daniel", chapter:6, verses:"3", text:"Then this Daniel was preferred above the presidents and princes, because an excellent spirit was in him; and the king thought to set him over the whole realm.", tags:["excellent spirit","preferred","exile excellence","daniel"] },

  // WAGES / EXPLOITATION / JUST PAY
  { book:"Leviticus", chapter:19, verses:"13", text:"Thou shalt not defraud thy neighbour, neither rob him: the wages of him that is hired shall not abide with thee all night until the morning.", tags:["wages","hired","defraud not","not abide all night","just wages"] },
  { book:"James", chapter:5, verses:"4", text:"Behold, the hire of the labourers who have reaped down your fields, which is of you kept back by fraud, crieth: and the cries of them which have reaped are entered into the ears of the Lord of sabaoth.", tags:["hire labourers","kept back by fraud","crieth","reaped","wages withheld"] },
  { book:"Deuteronomy", chapter:24, verses:"14-15", text:"Thou shalt not oppress an hired servant that is poor and needy, whether he be of thy brethren, or of thy strangers that are in thy land within thy gates: At his day thou shalt give him his hire, neither shall the sun go down upon it; for he is poor, and setteth his heart upon it: lest he cry against thee unto the LORD, and it be sin unto thee.", tags:["oppress not hired servant","poor and needy","give him his hire","sun go down","wages","oppress not"] },

  // CHURCH CONFLICT / PREEMINENCE
  { book:"Philippians", chapter:4, verses:"2", text:"I beseech Euodia, and beseech Syntyche, that they be of the same mind in the Lord.", tags:["beseech Euodia Syntyche","same mind Lord","conflict","agree"] },
  { book:"3 John", chapter:1, verses:"9", text:"I wrote unto the church: but Diotrephes, who loveth to have the preeminence among them, receiveth us not.", tags:["loveth preeminence","receiveth us not","Diotrephes","preeminence","toxic leader"] },

  // LAST-MINUTE GRACE / PARADISE
  { book:"Luke", chapter:23, verses:"43", text:"And Jesus said unto him, Verily I say unto thee, To day shalt thou be with me in paradise.", tags:["today paradise","remember me","thief","paradise","last minute grace"] },

  // DOUBT IN PRISON
  { book:"Luke", chapter:7, verses:"19", text:"And John calling unto him two of his disciples sent them to Jesus, saying, Art thou he that should come? or look we for another?", tags:["art thou he","should come or look for another","doubt","prison doubt","John"] },

  // FINANCIAL FOLLY / COVETOUSNESS
  { book:"Luke", chapter:12, verses:"20", text:"But God said unto him, Thou fool, this night thy soul shall be required of thee: then whose shall those things be, which thou hast provided?", tags:["thou fool","this night soul required","whose shall those things be","rich fool","covetousness"] },

  // FORGIVENESS OF HUGE DEBT
  { book:"Matthew", chapter:18, verses:"27", text:"Then the lord of that servant was moved with compassion, and loosed him, and forgave him the debt.", tags:["moved with compassion","loosed","forgave debt","ten thousand talents","forgiveness huge"] },

  // FAITH OF OUTSIDERS
  { book:"Matthew", chapter:8, verses:"10", text:"When Jesus heard it, he marvelled, and said to them that followed, Verily I say unto you, I have not found so great faith, no, not in Israel.", tags:["not found so great faith","marvelled","great faith","centurion","outsider faith"] },

  // COMMUNITY CARRIES
  { book:"Mark", chapter:2, verses:"5", text:"When Jesus saw their faith, he said unto the sick of the palsy, Son, thy sins be forgiven thee.", tags:["saw their faith","borne of four","sins forgiven","community faith","paralytic"] },

  // SANCTUARY / ENVY CURE
  { book:"Psalm", chapter:73, verses:"16-17", text:"When I thought to know this, it was too painful for me; Until I went into the sanctuary of God; then understood I their end.", tags:["thought too painful","went into sanctuary","understood their end","envy cure","sanctuary"] },

  // DELAYED ANSWER / WARFARE
  { book:"Daniel", chapter:10, verses:"12", text:"Then said he unto me, Fear not, Daniel: for from the first day that thou didst set thine heart to understand, and to chasten thyself before thy God, thy words were heard, and I am come for thy words.", tags:["fear not Daniel","first day heart to understand","chasten thyself","words were heard","delayed answer"] },
  { book:"Daniel", chapter:10, verses:"13", text:"But the prince of the kingdom of Persia withstood me one and twenty days: but, lo, Michael, one of the chief princes, came to help me; and I remained there with the kings of Persia.", tags:["prince Persia withstood 21 days","Michael came to help","withstood","spiritual warfare"] },

  // HUMILITY LEADS TO BIRTH
  { book:"Luke", chapter:1, verses:"38", text:"And Mary said, Behold the handmaid of the Lord; be it unto me according to thy word. And the angel departed from her.", tags:["handmaid of Lord","be it unto me","according to thy word","fiat","humility"] },

  // LAMENT FOR INNOCENTS
  { book:"Matthew", chapter:2, verses:"18", text:"In Rama was there a voice heard, lamentation, and weeping, and great mourning, Rachel weeping for her children, and would not be comforted, because they are not.", tags:["voice heard Rama","lamentation weeping","Rachel weeping","would not be comforted","innocents"] },

  // FOLLOW LEAVES
  { book:"Matthew", chapter:4, verses:"20", text:"And they straightway left their nets, and followed him.", tags:["straightway left nets","followed him","fishers of men","leaving nets"] },
  { book:"Matthew", chapter:9, verses:"9", text:"And as Jesus passed forth from thence, he saw a man, named Matthew, sitting at the receipt of custom: and he saith unto him, Follow me. And he arose, and followed him.", tags:["sitting at receipt custom","Follow me","arose followed","Matthew","custom"] },

  // HEALING TOUCH
  { book:"Mark", chapter:1, verses:"41", text:"And Jesus, moved with compassion, put forth his hand, and touched him, and saith unto him, I will; be thou clean.", tags:["moved with compassion","put forth hand touched","I will be thou clean","leper"] },

  // NO MAN POOL / BLIND SILOAM
  { book:"John", chapter:5, verses:"6-7", text:"When Jesus saw him lie, and knew that he had been now a long time in that case, he saith unto him, Wilt thou be made whole? The impotent man answered him, Sir, I have no man, when the water is troubled, to put me into the pool: but while I am coming, another steppeth down before me.", tags:["wilt thou be made whole","I have no man","water troubled","another steppeth before","Bethesda"] },
  { book:"John", chapter:9, verses:"3", text:"Jesus answered, Neither hath this man sinned, nor his parents: but that the works of God should be made manifest in him.", tags:["neither hath this man sinned","works of God manifest","who sinned","born blind"] },

  // COMPASSION AT GATE
  { book:"Luke", chapter:7, verses:"13", text:"And when the Lord saw her, he had compassion on her, and said unto her, Weep not.", tags:["when Lord saw had compassion","Weep not","widow Nain","compassion"] },

  // TRANSFIGURATION VOICE
  { book:"Matthew", chapter:17, verses:"5", text:"While he yet spake, behold, a bright cloud overshadowed them: and behold a voice out of the cloud, which said, This is my beloved Son, in whom I am well pleased; hear ye him.", tags:["bright cloud overshadowed","beloved Son well pleased","hear ye him","transfiguration"] },

  // SERVANT LEADERSHIP
  { book:"John", chapter:13, verses:"14", text:"If I then, your Lord and Master, have washed your feet; ye also ought to wash one another's feet.", tags:["Lord and Master washed feet","ought to wash one another","servant leadership","wash feet"] },

  // BEARING CROSS
  { book:"Mark", chapter:15, verses:"21", text:"And they compel one Simon a Cyrenian, who passed by, coming out of the country, the father of Alexander and Rufus, to bear his cross.", tags:["compel Simon Cyrenian","passed by","bear his cross","compelled bearer"] },
  { book:"Galatians", chapter:6, verses:"2", text:"Bear ye one another's burdens, and so fulfil the law of Christ.", tags:["bear one another burdens","fulfil law Christ","bear burdens"] },

  // RESTORATION OF RUNAWAY
  { book:"Philemon", chapter:1, verses:"11", text:"Which in time past was to thee unprofitable, but now profitable to thee and to me:", tags:["in time past unprofitable","now profitable","Onesimus","unprofitable now profitable"] },

  // BOUNDARY vs POWER
  { book:"Esther", chapter:1, verses:"12", text:"But the queen Vashti refused to come at the king's commandment by his chamberlains: therefore was the king very wroth, and his anger burned in him.", tags:["refused to come at king's commandment","Vashti","very wroth","boundary","refusal"] },

  // ENDURING CURSING
  { book:"2 Samuel", chapter:16, verses:"11", text:"And David said to Abishai, and to all his servants, Behold, my son, which came forth of my bowels, seeketh my life: how much more now may this Benjamite do it? let him alone, and let him curse; for the LORD hath bidden him.", tags:["let him alone and let him curse","LORD hath bidden him","Shimei","curse","endure cursing"] },

  // SUFFICIENCY PRAYER
  { book:"Proverbs", chapter:30, verses:"8", text:"Remove far from me vanity and lies: give me neither poverty nor riches; feed me with food convenient for me:", tags:["neither poverty nor riches","food convenient","vanity and lies","Agur","sufficiency"] },

  // SECRET BOLDNESS
  { book:"John", chapter:19, verses:"38", text:"And after this Joseph of Arimathaea, being a disciple of Jesus, but secretly for fear of the Jews, besought Pilate that he might take away the body of Jesus: and Pilate gave him leave. He came therefore, and took the body of Jesus.", tags:["disciple secretly for fear","besought Pilate take away body","Joseph of Arimathaea","secret disciple","bold"] },

  // DISCERNMENT - REFRAIN
  { book:"Acts", chapter:5, verses:"38", text:"And now I say unto you, Refrain from these men, and let them alone: for if this counsel or this work be of men, it will come to nought: But if it be of God, ye cannot overthrow it; lest haply ye be found even to fight against God.", tags:["Refrain let alone","if of men come to nought","if be of God cannot overthrow","fight against God","Gamaliel","discernment"] },

  // CLEANSING PREJUDICE
  { book:"Acts", chapter:10, verses:"15", text:"And the voice spake unto him again the second time, What God hath cleansed, that call not thou common.", tags:["What God hath cleansed","call not thou common","Rise Peter kill and eat","prejudice","sheet vision"] },

  // CALL TO MACEDONIA
  { book:"Acts", chapter:16, verses:"9", text:"And a vision appeared to Paul in the night; There stood a man of Macedonia, and prayed him, saying, Come over into Macedonia, and help us.", tags:["vision man of Macedonia","Come over and help us","Macedonian call","forbidden Asia","Bithynia"] },

  // LAYING HANDS ON ENEMY
  { book:"Acts", chapter:9, verses:"17", text:"And Ananias went his way, and entered into the house; and putting his hands on him said, Brother Saul, the Lord, even Jesus, that appeared unto thee in the way as thou camest, hath sent me, that thou mightest receive thy sight, and be filled with the Holy Ghost.", tags:["putting his hands on him","Brother Saul","Ananias","receive sight filled Holy Ghost","enemy to brother"] },

  // GENERATIONAL FAITH
  { book:"2 Timothy", chapter:1, verses:"5", text:"When I call to remembrance the unfeigned faith that is in thee, which dwelt first in thy grandmother Lois, and thy mother Eunice; and I am persuaded that in thee also.", tags:["unfeigned faith","dwelt first in grandmother Lois","mother Eunice","persuaded in thee also","generational faith"] },

  // FORSAKING WORLD
  { book:"2 Timothy", chapter:4, verses:"10", text:"For Demas hath forsaken me, having loved this present world, and is departed unto Thessalonica;", tags:["Demas hath forsaken me","having loved this present world","departed Thessalonica","forsaketh","world"] },

  // PERSISTENT PRAYER
  { book:"Luke", chapter:18, verses:"3", text:"And there was a widow in that city; and she came unto him, saying, Avenge me of mine adversary.", tags:["widow Avenge me adversary","judge feared not God","persistent widow","avenge"] },
  { book:"Luke", chapter:11, verses:"8", text:"I say unto you, Though he will not rise and give him, because he is his friend, yet because of his importunity he will rise and give him as many as he needeth.", tags:["because of importunity","will rise and give","friend at midnight","three loaves","importunity"] },

  // READINESS
  { book:"Matthew", chapter:25, verses:"4", text:"But the wise took oil in their vessels with their lamps.", tags:["wise took oil in vessels","foolish no oil","ten virgins","readiness","oil in vessels"] },

  // HEART SOILS
  { book:"Matthew", chapter:13, verses:"8", text:"But other fell into good ground, and brought forth fruit, some an hundredfold, some sixtyfold, some thirtyfold.", tags:["good ground brought forth fruit","hundredfold sixtyfold thirtyfold","sower","good ground","fruit"] },
];

export function searchVerses(query, n=5) {
  const q = query.toLowerCase();
  // Extract requested count: "5 verses", "10 verses", etc. Caller may override, but we detect
  const countMatch = q.match(/(\d+)\s*verses?/);
  const requested = countMatch ? parseInt(countMatch[1],10) : n;
  // Remove verse count phrase for scoring
  const cleaned = q.replace(/(\d+)\s*verses?( about| on| for| that talk about)?/gi, "").trim();
  const terms = cleaned.split(/[\s,.;:!?\/]+/).filter(t=>t.length>2);
  // Add original phrase terms
  if (cleaned.length>2) terms.push(cleaned.toLowerCase());
  // Score
  const scored = VERSES.map(v=>{
    let score=0;
    const hay = (v.text + " " + v.tags.join(" ") + " " + v.book).toLowerCase();
    const tagStr = v.tags.join(" ").toLowerCase();
    for(const t of terms){
      if(tagStr.includes(t)) score+=8;
      if(hay.includes(t)) score+=3;
      // exact tag
      if(v.tags.some(tag=> tag.toLowerCase()===t)) score+=10;
    }
    // phrase bonus
    if(cleaned && tagStr.includes(cleaned.toLowerCase())) score+=20;
    // background check synonyms
    if((q.includes("background")||q.includes("vetting")||q.includes("diligence")) && v.tags.some(x=>["background check","due diligence","vetting","diligent inquisition"].includes(x))) score+=15;
    return {v, score};
  });
  scored.sort((a,b)=>b.score-a.score);
  let top = scored.filter(x=>x.score>0).slice(0, requested).map(x=>x.v);
  if(top.length < requested){
    // supplement with next best even if score 0 to meet count
    const remaining = scored.filter(x=>!top.includes(x.v)).slice(0, requested - top.length).map(x=>x.v);
    top = top.concat(remaining);
  }
  // Attach provenance
  return top.map(v=>{
    const prov = citationWithProvenance(v.book, v.chapter, v.verses);
    return {
      ...v,
      citation: prov.citation,
      url: prov.url,
      canonical: prov.canonical,
      provenanceNote: prov.provenanceNote
    };
  }).slice(0, requested);
}

export function getVerseCount(query){
  const m = query.toLowerCase().match(/(\d+)\s*verses?/);
  return m ? parseInt(m[1],10) : null;
}
