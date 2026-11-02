/* «Книжная полка» — прототип.
   Список книг — ровно тот, что дала Маргарита. Заметки — только её собственные, без аннотаций и оценок.
   Корешки и обложки нарисованы кодом: цвет, толщина, высота и шрифт заданы у каждой книги вручную,
   чтобы полка была разной, но аккуратной. Это не копии настоящих обложек: их можно заменить фото своих экземпляров. */
(() => {
  const COLORS = {
    navy: '#23395b', oxblood: '#6d2128', forest: '#2f4a3a', mustard: '#d9a63a', cream: '#efe6d2', ink: '#1f2427',
    terracotta: '#b5583a', slate: '#5c6b78', sky: '#a9c8db', blush: '#e8c4bb', olive: '#6f6f36', white: '#f7f5ef',
    teal: '#2c6e6a', plum: '#4b2e45', sand: '#d8c7a3',
  };
  const LIGHT = new Set(['mustard', 'cream', 'sky', 'blush', 'white', 'sand']);

  // Общие заметки Маргариты к нескольким книгам сразу
  // Общая заметка к группе книг автора: показывается в карточке каждой книги группы, хранится один раз
  const KING_GROUP = 'Ооо, Кинг! Люблю, как он постепенно нагнетает напряжение и раскрывает персонажей. У него страшно бывает не только из-за мистики, но и из-за самих людей.';

  // Общее впечатление от Ремарка — для заметки ко всей группе автора. Пока не показывается, ждёт согласования
  const REMARQUE_GROUP = 'У Ремарка меня цепляет то, как рядом существуют любовь, дружба, потери и ощущение, что завтра может ничего не быть. Его герои пытаются жить, даже когда обстоятельства совсем к этому не располагают.';
  const OMER = 'Чтобы ловить монстров, нужно думать как они. Зачитывалась: главный фокус — мышление маньяка и профайлинг, невозможно оторваться';

  // [автор, название, заметка, цвет, толщина, высота, шрифт]
  const G = [
    { key: 'work', name: 'Работа и идеи', groups: [{ books: [
      ['Сьюзан Уэйншенк', '100 главных принципов дизайна', 'Дизайн тесно связан с психологией. В книге много интересного о том, как работает мозг, как мы воспринимаем информацию, куда направляем внимание, как реагируем на визуальные элементы и принимаем решения.', 'mustard', 46, 224, 'bold'],
      ['Максим Ильяхов', 'Ясно, понятно', 'Ой, ну восторг. Книга и курс очень вовремя ко мне прилетели. Помогли по-новому взглянуть на тексты и свою работу.', 'white', 40, 216, 'bold'],
      ['Максим Ильяхов, Людмила Сарычева', 'Пиши, сокращай', '', 'cream', 44, 222, 'sans'],
      ['Грег Хоффман', 'Создавая эмоции', 'Классная книга! История Nike, решений и идей, к которым команда приходила годами. Очень расширяет представление о том, как создаются бренды и почему люди к ним привязываются.', 'ink', 30, 212, 'caps'],
      ['Лоренс Ларс Свекис, Майке ван Путтен, Роб Персиваль', 'JavaScript с нуля до профи', '', 'sky', 46, 232, 'mono'],
      ['Дженифер Тидвелл, Чарли Брюэр, Эйнн Валенсия', 'Разработка интерфейсов. Паттерны проектирования', '', 'terracotta', 50, 234, 'sans'],
      ['Кирилл Егерев', 'Этой кнопке нужен текст', '', 'blush', 36, 198, 'bold'],
      ['Лоуренс Леви', 'PIXAR. Перезагрузка. Как вдохнуть в бизнес новую жизнь', 'Тут тоже восторг! Удивило, что Стив Джобс годами финансировал Pixar из собственных средств, а в 1995 году вышла «История игрушек» — первый полнометражный мультфильм, полностью созданный с помощью компьютерной анимации. Ну потрясающе ведь!', 'navy', 32, 214, 'caps'],
    ] }] },
    { key: 'classics', name: 'Классика и романы', groups: [
      { label: 'Митчелл', books: [
        ['Маргарет Митчелл', 'Унесённые ветром', 'Моя любовь. Читала в детстве и перечитывала позже, каждый раз читается иначе. Про взросление, силу духа и про то, как зацикленность мешает жить', 'terracotta', 56, 222, 'serif'],
      ] },
      { label: 'Джейн Остин', books: [
        ['Джейн Остин', 'Гордость и предубеждение', 'Ещё одна моя любовь с детства. Периодически перечитываю и каждый раз замечаю что-то новое. С возрастом даже знакомые герои воспринимаются иначе, особенно когда речь о любви и отношениях. Но эта история по-прежнему остаётся для меня очень живой.', 'oxblood', 36, 208, 'serif'],
        ['Джейн Остин', 'Доводы рассудка', '', 'sand', 30, 200, 'serif'],
        ['Джейн Остин', 'Эмма', '', 'forest', 38, 206, 'serif'],
      ] },
      { label: 'Бронте', books: [
        ['Шарлотта Бронте', 'Джейн Эйр', '', 'plum', 40, 212, 'serif'],
        ['Эмили Бронте', 'Грозовой перевал', 'Одержимость, гордость, месть и истерики. Тут точно не про любовь', 'slate', 34, 210, 'serif'],
      ] },
      { label: 'Теодор Драйзер', books: [
        ['Теодор Драйзер', 'Американская трагедия', 'Не так часто меня раздражают книжные герои, но у Драйзера великолепно вышло :) Инфантильные, эгоцентричные и вечно находящие оправдания своим поступкам.', 'ink', 52, 220, 'caps'],
        ['Теодор Драйзер', 'Сестра Керри', '', 'mustard', 40, 214, 'serif'],
      ] },
      { label: 'Эрих Мария Ремарк', mark: true, note: REMARQUE_GROUP, books: [
        ['Эрих Мария Ремарк', 'На Западном фронте без перемен', 'Первая половина шла тяжело, думала, что просто заставлю себя дочитать. Потом поняла: Ремарк хотел показать обычных ребят с обычными мыслями и увлечениями. Люди — всегда люди', 'olive', 38, 204, 'caps'],
        ['Эрих Мария Ремарк', 'Три товарища', '', 'cream', 40, 210, 'serif'],
        ['Эрих Мария Ремарк', 'Жизнь взаймы', '', 'teal', 30, 200, 'serif'],
        ['Эрих Мария Ремарк', 'Триумфальная арка', '', 'oxblood', 42, 214, 'caps'],
      ] },
      { label: 'Другие авторы', books: [
        ['Оскар Уайльд', 'Портрет Дориана Грея', 'Ноль романтизации. За красивыми словами и рассуждениями скрывается очень искажённое представление о ценностях. Для меня эта история ещё и о том, что нельзя бесконечно перекладывать ответственность за свои поступки на других.', 'white', 36, 200, 'serif'],
        ['Артур Голден', 'Мемуары гейши', 'Очень люблю эту книгу и периодически к ней возвращаюсь. Каждый раз хочется снова погрузиться в эту историю.', 'blush', 40, 214, 'serif'],
        ['Маркус Зусак', 'Книжный вор', '', 'sand', 40, 208, 'sans'],
        ['Колин Маккалоу', 'Поющие в терновнике', '', 'forest', 46, 220, 'serif'],
        ['Александр Дюма', 'Граф Монте-Кристо', '', 'oxblood', 58, 228, 'caps'],
        ['Пауло Коэльо', 'Алхимик', 'Читала лет десять назад, и тогда книга мне очень понравилась. Она попалась как раз в тот период, когда сама искала какие-то ответы и пыталась понять, куда двигаться дальше. Наверное, поэтому так откликнулась.', 'sky', 30, 204, 'serif'],
        ['Павел Санаев', 'Похороните меня за плинтусом', 'Самая мерзкая книга. Прочитала примерно в 2018 году и долго не могла отмыться. Как и в «Мизери», под видом безумной любви и заботы — сплошные издевательства. Оставляет ощущение беспомощности и грязи', 'slate', 30, 204, 'sans'],
      ] },
    ] },
    { key: 'thrillers', name: 'Триллеры и детективы', groups: [
      { label: 'Стивен Кинг', mark: true, note: KING_GROUP, books: [
        ['Стивен Кинг', 'Мизери', 'История об извращённом восприятии', 'ink', 38, 214, 'bold'],
        ['Стивен Кинг', 'Кэрри', 'Про то, как подавленные эмоции, травля и одиночество могут привести к глобальному разрушению', 'oxblood', 32, 206, 'bold'],
        ['Стивен Кинг', 'Сияние', 'Редко возмущаюсь экранизациями, но здесь помню своё негодование. В фильме потеряли важную нить истории и то, как постепенно меняется главный герой. При этом сам фильм мне тоже нравится — просто это другое «Сияние»', 'white', 44, 220, 'bold'],
        ['Стивен Кинг', '11/22/63', 'Читала книгу и смотрела сериал. Больше всего запомнилась мысль: нельзя вмешаться в прошлое и рассчитывать, что это пройдёт без последствий.', 'navy', 50, 226, 'bold'],
        ['Стивен Кинг', 'Дьюма-Ки', '', 'teal', 46, 218, 'bold'],
      ] },
      { label: 'Майк Омер', books: [
        ['Майк Омер', 'Внутри убийцы', OMER, 'slate', 34, 208, 'caps'],
        ['Майк Омер', 'Заживо в темноте', OMER, 'ink', 34, 208, 'caps'],
        ['Майк Омер', 'Глазами жертвы', OMER, 'forest', 34, 208, 'caps'],
        ['Майк Омер', 'Как ты умрёшь', '', 'oxblood', 34, 208, 'caps'],
      ] },
      { label: 'Агата Кристи', books: [
        ['Агата Кристи', 'Десять негритят («И никого не стало»)', '', 'mustard', 30, 212, 'serif'],
        ['Агата Кристи', 'Убийство в Восточном экспрессе', '', 'navy', 38, 212, 'serif'],
      ] },
      { books: [
        ['Алекс Михаэлидес', 'Безмолвный пациент', 'Читается легко, интрига держит всю книгу. Открытый, но понятный финал и своеобразное послевкусие: не тот псих, что псих', 'white', 34, 210, 'sans'],
      ] },
    ] },
    { key: 'psychology', name: 'Психология и мышление', intro: 'Психологией и устройством мышления интересовалась задолго до появления инстаграмных психологов. Чему рада.\nОдно из главных правил: волшебной таблетки нет и нужно учиться фильтровать информацию.', groups: [{ books: [
      ['Роберт Антон Уилсон', 'Квантовая психология', 'Одна из самых дельных книг: научила отслеживать свои мысли и эмоции. Мозг — это механизм, и с ним можно подружиться', 'plum', 36, 212, 'caps'],
      ['Даниэль Канеман', 'Думай медленно… решай быстро', '', 'white', 48, 220, 'sans'],
      ['Эрик Берн', 'Игры, в которые играют люди', '', 'mustard', 32, 206, 'bold'],
      ['Эрик Берн', 'Люди, которые играют в игры', '', 'terracotta', 34, 206, 'bold'],
      ['Джон Кехо', 'Подсознание может всё!', '', 'teal', 30, 204, 'sans'],
      ['Михаил Лабковский', 'Хочу и буду', '', 'blush', 30, 204, 'bold'],
      ['Джозеф Мерфи', 'Сила подсознания', '', 'navy', 34, 210, 'serif'],
      ['Джо Диспенза', 'Сила мысли. Измени ход своих мыслей — измени свою жизнь', '', 'sky', 38, 214, 'sans'],
    ] }] },
    { key: 'nonfiction', name: 'Биографии, реальные истории и нон-фикшн', groups: [{ books: [
      ['Фрэнк Абигнейл, Стэн Реддинг', 'Поймай меня, если сможешь', 'В целом гениально, конечно: столько придумывать! Фильм тоже интересный.', 'sky', 38, 214, 'sans'],
    ] }] },
    { key: 'dystopia', name: 'Антиутопии и фантастика', groups: [{ books: [
      ['Рэй Брэдбери', '451 градус по Фаренгейту', '«Шире открой глаза, живи так жадно, как будто через десять секунд умрёшь».', 'terracotta', 30, 204, 'caps'],
      ['Джордж Оруэлл', '1984', '«Старший брат видит тебя».', 'ink', 34, 210, 'caps'],
    ] }] },
    { key: 'dnf', name: 'Не сложилось', note: 'Книги, которые не дочитала', groups: [{ books: [
      ['Мария Корелли', 'Скорбь Сатаны', 'Стало скучно. Диалоги однотипные, сплошные псевдофилософские вбросы и бесконечные рассуждения об одном и том же. В какой-то момент просто надоело.', 'plum', 46, 216, 'serif'],
      ['Габриэль Гарсиа Маркес', 'Сто лет одиночества', 'Не дочитала', 'mustard', 40, 212, 'serif'],
      ['Михаил Булгаков', 'Мастер и Маргарита', 'Несколько раз начинала читать и каждый раз откладывала. Интересно, когда я всё-таки до неё доберусь.', 'ink', 44, 218, 'serif'],
    ] }] },
  ];

  // Уточнение жанра у отдельных книг (показывается в карточке рядом с меткой полки)
  const KIND = { 'Алхимик': 'философский роман-притча', 'Внутри убийцы': 'серия о Зои Бентли', 'Заживо в темноте': 'серия о Зои Бентли', 'Глазами жертвы': 'серия о Зои Бентли', 'Как ты умрёшь': 'серия о Зои Бентли' };

  // Аннотации: одна книга — одна мысль. Только проверенное содержание, без оценок.
  const ABOUT = {
    "100 главных принципов дизайна": "Почему люди замечают одно и пропускают другое и что из этого следует для интерфейсов",
    "Ясно, понятно": "Как объяснять сложное так, чтобы поняли с первого раза",
    "Пиши, сокращай": "Как убрать из текста лишнее и оставить читателю пользу",
    "Создавая эмоции": "Бывший директор по маркетингу Nike о том, что бренды запоминают по чувствам, а не по характеристикам",
    "JavaScript с нуля до профи": "Язык с первых строк кода до работы со страницей, с упражнениями на каждом шаге",
    "Разработка интерфейсов. Паттерны проектирования": "Справочник проверенных решений для типовых задач интерфейса: навигации, форм, списков",
    "Этой кнопке нужен текст": "Слова в интерфейсе — тоже дизайн, а не подписи к нему",
    "PIXAR. Перезагрузка. Как вдохнуть в бизнес новую жизнь": "История Pixar глазами финансового директора: от студии с одной идеей до «Истории игрушек» и выхода на биржу",
    "Гордость и предубеждение": "Первое впечатление о человеке обманывает, и это касается обоих героев",
    "Доводы рассудка": "Второй шанс на любовь спустя восемь лет после разумного «нет»",
    "Эмма": "Героиня точно знает, кто кому подходит, но только не когда речь о ней самой",
    "Джейн Эйр": "История о любви, достоинстве и умении не предавать себя даже ради сильных чувств",
    "Грозовой перевал": "Любовь, которая превращается в одержимость и месть на два поколения",
    "Американская трагедия": "Желание пробиться наверх любой ценой доводит до преступления",
    "Сестра Керри": "Провинциальная девушка поднимается в большом городе, а мужчина рядом с ней скатывается вниз",
    "На Западном фронте без перемен": "Первая мировая глазами вчерашнего школьника",
    "Три товарища": "Дружба и любовь в Германии между войнами, когда никто не уверен в завтрашнем дне",
    "Жизнь взаймы": "Гонщик и смертельно больная девушка решают прожить оставшееся время по-настоящему",
    "Триумфальная арка": "Хирург-беженец без документов в Париже накануне войны",
    "Унесённые ветром": "Скарлетт выживает в рушащемся мире Юга и всё главное откладывает на завтра",
    "Портрет Дориана Грея": "Стареет портрет, а не его хозяин",
    "Мемуары гейши": "Путь девочки из рыбацкой деревни в гейши довоенного Киото",
    "Книжный вор": "Нацистская Германия глазами девочки, которая крадёт книги, а рассказывает историю Смерть",
    "Поющие в терновнике": "Большая семейная история о любви, выборе и последствиях решений, которые тянутся через поколения",
    "Граф Монте-Кристо": "Невинно осуждённый моряк бежит из тюрьмы, богатеет и возвращается, чтобы отомстить",
    "Алхимик": "Молодой пастух отправляется на поиски сокровища, а по дороге пытается понять, чего на самом деле хочет от жизни",
    "Похороните меня за плинтусом": "Детство мальчика у властной бабушки, рассказанное его голосом",
    "Мизери": "Писатель в плену у своей самой преданной поклонницы",
    "Кэрри": "Затравленная школьница с телекинезом и выпускной, который никто не забудет",
    "Сияние": "Пустой зимний отель, отрезанный от мира, и семья смотрителя внутри",
    "11/22/63": "Учитель возвращается в прошлое, чтобы предотвратить убийство Кеннеди",
    "Дьюма-Ки": "После аварии художник переезжает на остров во Флориде и начинает рисовать. Постепенно выясняется, что его картины способны влиять на реальность",
    "Внутри убийцы": "Профайлер Зои Бентли и агент Тейтум Грей ищут убийцу, который бальзамирует своих жертв",
    "Заживо в темноте": "Убийца закапывает женщин живыми и выкладывает видео в сеть",
    "Глазами жертвы": "Новое убийство похоже на почерк маньяка из прошлого Зои, но детали не сходятся",
    "Как ты умрёшь": "Жертвы заранее получают предупреждение о своей смерти. Предыстория цикла, Зои здесь на втором плане",
    "Десять негритят («И никого не стало»)": "«Десять негритят отправились обедать, один поперхнулся, их осталось девять…»",
    "Убийство в Восточном экспрессе": "Поезд застрял в снегу, в купе убитый, и убийца всё ещё среди пассажиров",
    "Безмолвный пациент": "Художница застрелила мужа и с тех пор молчит, а психотерапевт пытается понять почему",
    "Думай медленно… решай быстро": "Мы думаем быстро и интуитивно или медленно и с усилием, и быстрый способ ошибается чаще, чем кажется",
    "Игры, в которые играют люди": "Повторяющиеся сценарии в общении, за которыми прячутся скрытые выгоды",
    "Люди, которые играют в игры": "Откуда берутся жизненные сценарии и как их пишут ещё в детстве",
    "Подсознание может всё!": "Как привычные мысли и образы влияют на то, что происходит в жизни",
    "Хочу и буду": "Как перестать жить «как надо» и начать слышать свои желания",
    "Сила подсознания": "Классика о том, как установки и внушение влияют на здоровье, деньги и отношения",
    "Поймай меня, если сможешь": "История обаятельного мошенника, который, по собственным рассказам, успел побывать пилотом, врачом и юристом, подделывал чеки и годами уходил от преследования",
    "Сила мысли. Измени ход своих мыслей — измени свою жизнь": "О том, как привычные мысли, убеждения и реакции влияют на поведение, и как автор предлагает менять эти шаблоны",
    "Квантовая психология": "Как язык и убеждения создают то, что мы считаем реальностью",
    "451 градус по Фаренгейту": "Мир, где пожарные не тушат, а сжигают книги",
    "1984": "Государство следит за каждым и переписывает прошлое",
    "Скорбь Сатаны": "Нищий писатель внезапно богатеет и сближается с таинственным князем",
    "Мастер и Маргарита": "Сатана со свитой приезжает в Москву 1930-х, а рядом идёт роман о Понтии Пилате",
    "Сто лет одиночества": "Семь поколений семьи Буэндиа в вымышленном городке Макондо"
  };

  // Запуск: на отдельной странице сразу, в окне Finder — из finder-app.js при открытии раздела (window.shelfInit)
  const init = (scope) => {
  const lib = scope.querySelector('[data-lib]');
  if (!lib || lib.dataset.ready) return () => {};
  lib.dataset.ready = '1';
  const off = [];
  const tabsBox = lib.querySelector('[data-lib-tabs]');
  const shelf = lib.querySelector('[data-shelf]');
  const labels = lib.querySelector('[data-labels]');
  // подпись к полке жанра (если есть): для телефона и читалок — над полкой, на компьютере видна прямо на полке
  const shelfNote = document.createElement('p');
  shelfNote.className = 'lib__shelfnote lib__shelfnote--top';
  shelfNote.hidden = true;
  lib.querySelector('.lib__case').before(shelfNote);
  const open = lib.querySelector('[data-open]');
  const status = document.querySelector('[data-status]');   // статусная строка прототипа. В Finder её заполняет finder-app.js
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Типографика: короткие слова не висят в конце строки, тире не начинает строку
  const SHORT = /(?<=^|[\s«(„"])(в|во|и|а|о|об|у|к|ко|с|со|на|по|за|из|от|до|не|ни|но|же|ли|бы|то|для|при|без|под|над|про|что|как|или|его|её|их|мы|вы|он|она|оно|они|я|ты|это|все|всё)[ \t\r\n]+/giu;
  const typo = (t) => {
    const out = String(t).replace(SHORT, '$1\u00a0');
    return out.replace(/\s+—/g, '\u00a0—').replace(/(\d)\s+(год|году|года|лет|книг|книги|книга)/g, '$1\u00a0$2');
  };
  const raw = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const esc = (s) => raw(typo(s));   // для текстов карточки. На корешках и обложках строки короткие — там без склейки (raw)
  const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];

  const books = [];
  G.forEach((g) => g.groups.forEach((gr) => gr.books.forEach(([author, title, note, color, w, h, font]) => {
    books.push({ genre: g.key, genreName: g.name, group: gr.label || '', groupNote: gr.note || '', series: gr.series || '', author, title, note, color, w, h, font, i: books.length });
  })));
  const total = books.length;
  if (status) status.textContent = `${total} ${plural(total, ['книга', 'книги', 'книг'])}`;

  // ---------- Вкладки жанров ----------
  tabsBox.innerHTML = G.map((g, n) => {
    const c = books.filter((b) => b.genre === g.key).length;
    return `<button type="button" role="tab" id="tab-${g.key}" aria-controls="shelf" data-genre="${g.key}" tabindex="${n ? -1 : 0}">${g.name}<span>${c}</span></button>`;
  }).join('');
  const tabs = [...tabsBox.children];
  shelf.id = 'shelf';
  shelf.setAttribute('role', 'tabpanel');

  // На корешке — короткое название, как у настоящих изданий. Полное — в открытой книге и для читалок.
  const short = (t) => {
    let x = t.replace(/\s*\(.*\)$/, '');
    if (x.length > 30 && x.includes('. ')) { const parts = x.split('. '); x = parts[0].length < 8 ? `${parts[0]}. ${parts[1]}` : parts[0]; }
    return x;
  };
  const spine = (b, k = 0) => {
    const light = LIGHT.has(b.color);
    return `<button type="button" class="bk bk--${b.font}${light ? ' bk--light' : ''}" data-book="${b.i}" tabindex="-1"
      style="--c:${COLORS[b.color]};--w:${b.w}px;--h:${b.h}px;--i:${k}" aria-label="${esc(b.title)}, ${esc(b.author)}">
      <i class="bk__band" aria-hidden="true"></i>
      <span class="bk__title" aria-hidden="true">${raw(short(b.title))}</span>
      <span class="bk__author" aria-hidden="true">${esc(b.author.split(',')[0].split(' ').slice(-1)[0])}</span>
      <i class="bk__mark" aria-hidden="true"></i></button>`;
  };
  // На обложке при трёх и больше авторах — первый и «и др.», полный список есть в карточке
  // В заметках точку в конце не ставим (восклицательный знак, многоточие и смайлы остаются)
  const noDot = (t) => t.replace(/(?<!\.)\.\s*$/, '');
  const coverAuthor = (a) => { const list = a.split(', '); return list.length > 2 ? `${list[0]} и др.` : a; };
  const cover = (b) => {
    const light = LIGHT.has(b.color);
    return `<div class="cover cover--${b.font}${light ? ' cover--light' : ''}" style="--c:${COLORS[b.color]}" aria-hidden="true">
      <i class="cover__band"></i><span class="cover__author">${raw(coverAuthor(b.author))}</span><b class="cover__title">${raw(short(b.title))}</b><i class="cover__rule"></i></div>`;
  };

  // ---------- Полка ----------
  let genre = G[0].key;
  const selected = {};             // открытая книга по каждому жанру: при возврате на жанр место сохраняется
  const focusIndex = {};
  const spines = () => [...shelf.querySelectorAll('.bk')];

  const renderShelf = () => {
    const g = G.find((x) => x.key === genre);
    shelf.setAttribute('aria-labelledby', `tab-${genre}`);
    let order = 0;   // порядковый номер корешка на полке — для поочерёдного появления
    const intro = g.intro ? esc(g.intro).replace(/\n/g, '<br>') : '';
    shelfNote.innerHTML = intro;
    shelfNote.hidden = !intro;
    shelf.innerHTML = g.groups.map((gr) => `<div class="lib__grp${gr.mark ? ' is-marked' : ''}" data-label="${esc(gr.label || '')}">${books.filter((b) => b.genre === genre && b.group === (gr.label || '')).map((b) => spine(b, order++)).join('')}</div>`).join('') + (intro ? `<p class="lib__shelfnote" aria-hidden="true">${intro}</p>` : '');
    // подписи групп под доской — по ширине своей группы
    labels.innerHTML = g.groups.map((gr) => (gr.label ? `<span class="${gr.mark ? 'is-marked' : ''}">${esc(gr.label)}</span>` : '')).join('');
    requestAnimationFrame(() => { fitWidth(); fitSpines(); placeLabels(); });
    if (document.fonts) document.fonts.ready.then(() => { fitWidth(); fitSpines(); placeLabels(); });
    const list = spines();
    const fi = Math.min(focusIndex[genre] ?? 0, list.length - 1);
    list.forEach((s, n) => { s.tabIndex = n === fi ? 0 : -1; });
    if (!reduce.matches) { shelf.classList.remove('is-in'); void shelf.offsetWidth; shelf.classList.add('is-in'); }
    paintOpen();
  };
  const placeLabels = () => {
    const grps = [...shelf.querySelectorAll('.lib__grp')].filter((x) => x.dataset.label);
    const spans = [...labels.children];
    grps.forEach((grp, n) => { const s = spans[n]; if (!s) return; s.style.left = `${grp.offsetLeft - shelf.scrollLeft}px`; s.style.width = `${grp.offsetWidth}px`; });
    // подписи бывают в две строки: область растёт по самой высокой, карточка ниже не наезжает
    labels.style.height = spans.length ? `${Math.max(...spans.map((x) => x.offsetTop + x.offsetHeight)) + 4}px` : '';
  };
  // Название на корешке уменьшается, пока не поместится целиком: шрифты на разных системах разной ширины
  const fitWidth = () => {
    shelf.style.removeProperty('--wk');
    if (matchMedia('(max-width: 760px)').matches) return;
    const over = shelf.scrollWidth - shelf.clientWidth;
    if (over <= 0) return;
    const spinesW = spines().reduce((sum, x) => sum + x.offsetWidth, 0);
    shelf.style.setProperty('--wk', Math.max(0.8, (spinesW - over - 2) / spinesW).toFixed(3));
  };
  const fitSpines = () => {
    shelf.querySelectorAll('.bk__title, .bk__author').forEach((t) => {
      t.style.fontSize = '';
      let size = parseFloat(getComputedStyle(t).fontSize);
      const min = t.classList.contains('bk__author') ? 6.5 : 8;
      while (size > min && (t.scrollHeight > t.clientHeight + 1 || t.scrollWidth > t.clientWidth + 1)) { size -= 0.5; t.style.fontSize = `${size}px`; }
    });
  };
  shelf.addEventListener('scroll', placeLabels, { passive: true });
  const onResize = () => { fitWidth(); fitSpines(); placeLabels(); };
  window.addEventListener('resize', onResize);
  off.push(() => window.removeEventListener('resize', onResize));

  const closedByHand = {};          // жанр с одной книгой открывается сразу, пока её не закрыли вручную
  const setGenre = (key, focusTab = false) => {
    genre = key;
    const only = books.filter((x) => x.genre === key);
    if (only.length === 1 && selected[key] == null && !closedByHand[key]) selected[key] = only[0].i;
    tabs.forEach((t) => { const on = t.dataset.genre === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focusTab) t.focus(); });
    const at = tabs.find((t) => t.dataset.genre === key);   // выбранная вкладка не должна прятаться за краем ленты
    if (at && (at.offsetLeft < tabsBox.scrollLeft || at.offsetLeft + at.offsetWidth > tabsBox.scrollLeft + tabsBox.clientWidth)) tabsBox.scrollLeft = at.offsetLeft - 18;
    renderShelf();
  };
  // На телефоне вкладки листаются вбок: затухание у края подсказывает, что там есть ещё
  const edgeTabs = () => {
    const max = tabsBox.scrollWidth - tabsBox.clientWidth;
    tabsBox.classList.toggle('is-more-right', tabsBox.scrollLeft < max - 2);
    tabsBox.classList.toggle('is-more-left', tabsBox.scrollLeft > 2);
  };
  tabsBox.addEventListener('scroll', edgeTabs, { passive: true });
  window.addEventListener('resize', edgeTabs);
  off.push(() => window.removeEventListener('resize', edgeTabs));
  requestAnimationFrame(edgeTabs);
  tabs.forEach((t, n) => {
    t.addEventListener('click', () => setGenre(t.dataset.genre));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); setGenre(tabs[(n + d + tabs.length) % tabs.length].dataset.genre, true); }
      if (e.key === 'ArrowDown') { e.preventDefault(); spines().find((s) => s.tabIndex === 0)?.focus(); }
    });
  });

  // ---------- Открытая книга ----------
  // Жанр и открытая книга живут в адресе (?genre=…&book=N), поэтому переживают перезагрузку
  const writeUrl = () => {
    const url = new URL(location.href);
    url.searchParams.delete('genre'); url.searchParams.delete('book');
    if (genre !== G[0].key) url.searchParams.set('genre', genre);
    const i = selected[genre];
    if (i != null) url.searchParams.set('book', String(books.filter((x) => x.genre === genre).findIndex((x) => x.i === i) + 1));
    if (url.href !== location.href) history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  };

  const paintOpen = () => {
    writeUrl();
    const i = selected[genre];
    spines().forEach((s) => s.classList.toggle('is-open', Number(s.dataset.book) === i));
    if (i == null) {
      const g = G.find((x) => x.key === genre); const c = books.filter((x) => x.genre === genre).length;
      open.innerHTML = `<p class="lib__empty"><b>${esc(g.note || g.name)} · ${c} ${plural(c, ['книга', 'книги', 'книг'])}</b>Нажмите на&nbsp;корешок, чтобы открыть книгу</p>`;
      open.classList.remove('has-book'); return;
    }
    const b = books[i];
    const inGenre = books.filter((x) => x.genre === genre);
    const pos = inGenre.indexOf(b);
    const note = b.note || b.series;
    open.classList.add('has-book');
    open.innerHTML = `
      ${cover(b)}
      <div class="lib__info">
        <div class="lib__top">
          <p class="lib__meta"><span class="lib__tag">${esc(b.genreName)}</span>${KIND[b.title] ? `<span>${esc(KIND[b.title])}</span>` : b.group && b.group !== 'Другие авторы' ? `<span>${esc(b.group.split(' · ')[0])}</span>` : ''}</p>
          <div class="lib__nav">
            <button type="button" data-move="-1" aria-label="Предыдущая книга" ${pos === 0 ? 'disabled' : ''}>←</button>
            <span>${pos + 1} из ${inGenre.length}</span>
            <button type="button" data-move="1" aria-label="Следующая книга" ${pos === inGenre.length - 1 ? 'disabled' : ''}>→</button>
            <button type="button" class="lib__close" data-close aria-label="Закрыть книгу и вернуться к полке">Закрыть</button>
          </div>
        </div>
        <div class="lib__head"><h2 class="lib__title">${esc(b.title)}</h2>
        <p class="lib__author">${esc(b.author)}</p></div>
        ${ABOUT[b.title] ? `<p class="lib__about">${esc(ABOUT[b.title])}</p>` : ''}
        ${note ? `<blockquote class="lib__note"><small>Заметка</small>${esc(noDot(note)).replace(/\n/g, '<br>')}</blockquote>` : ''}
        ${b.groupNote ? `<p class="lib__groupnote">${esc(noDot(b.groupNote))}</p>` : ''}
      </div>`;
    fitCover();
    if (!reduce.matches) { open.classList.remove('is-in'); void open.offsetWidth; open.classList.add('is-in'); }
  };
  // Название на обложке уменьшается, пока самое длинное слово не помещается целиком и текст не вылезает за обложку
  const fitCover = () => {
    const t = open.querySelector('.cover__title');
    const c = open.querySelector('.cover');
    if (!t || !c) return;
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    document.body.appendChild(probe);
    const longest = () => {
      const st = getComputedStyle(t);
      Object.assign(probe.style, { font: st.font, letterSpacing: st.letterSpacing, textTransform: st.textTransform });
      return Math.max(...t.textContent.split(/\s+/).map((w) => { probe.textContent = w; return probe.offsetWidth; }));
    };
    let size = parseFloat(getComputedStyle(t).fontSize);
    const rule = c.querySelector('.cover__rule');
    // между названием и кружком внизу обложки — не меньше 10px
    const crowded = () => rule && t.getBoundingClientRect().bottom > rule.getBoundingClientRect().top - 10;
    const min = matchMedia('(max-width: 760px)').matches ? 7 : 8.5;   // на телефоне обложка — миниатюра
    while (size > min && (longest() > t.clientWidth || c.scrollHeight > c.clientHeight + 1 || crowded())) { size -= 0.5; t.style.fontSize = `${size}px`; }
    probe.remove();
  };
  const openBook = (i) => {
    selected[genre] = i;
    const list = spines();
    const n = list.findIndex((s) => Number(s.dataset.book) === i);
    focusIndex[genre] = n;
    list.forEach((s, k) => { s.tabIndex = k === n ? 0 : -1; });
    list[n]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce.matches ? 'auto' : 'smooth' });
    paintOpen();
    // длинная заметка может уйти за край окна: докручиваем карточку в видимую область
    requestAnimationFrame(() => open.scrollIntoView({ block: 'nearest', behavior: reduce.matches ? 'auto' : 'smooth' }));
  };
  const closeBook = () => {
    const i = selected[genre];
    delete selected[genre];
    closedByHand[genre] = true;
    paintOpen();
    spines().find((s) => Number(s.dataset.book) === i)?.focus();   // фокус возвращается на корешок
  };

  shelf.addEventListener('click', (e) => {
    const s = e.target.closest('.bk');
    if (!s) return;
    const i = Number(s.dataset.book);
    if (selected[genre] === i) closeBook(); else openBook(i);
  });
  shelf.addEventListener('keydown', (e) => {
    const list = spines();
    const n = list.indexOf(document.activeElement);
    if (n < 0) return;
    const to = { ArrowRight: n + 1, ArrowLeft: n - 1, Home: 0, End: list.length - 1 }[e.key];
    if (to != null) {
      e.preventDefault();
      const k = Math.max(0, Math.min(list.length - 1, to));
      list.forEach((s, j) => { s.tabIndex = j === k ? 0 : -1; });
      focusIndex[genre] = k;
      list[k].focus();
      if (selected[genre] != null) openBook(Number(list[k].dataset.book));  // книга открыта — листаем открытые
    }
    if (e.key === 'ArrowUp') { e.preventDefault(); tabs.find((t) => t.tabIndex === 0)?.focus(); }
  });
  open.addEventListener('click', (e) => {
    const mv = e.target.closest('[data-move]');
    if (mv) {
      const inGenre = books.filter((x) => x.genre === genre);
      const pos = inGenre.findIndex((x) => x.i === selected[genre]);
      const nb = inGenre[pos + Number(mv.dataset.move)];
      if (nb) { openBook(nb.i); open.querySelector(`[data-move="${mv.dataset.move}"]:not(:disabled)`)?.focus(); }
    }
    if (e.target.closest('[data-close]')) closeBook();
  });
  lib.addEventListener('keydown', (e) => { if (e.key === 'Escape' && selected[genre] != null) { e.stopPropagation(); closeBook(); } });

  const start = new URLSearchParams(location.search);
  if (G.some((g) => g.key === start.get('genre'))) genre = start.get('genre');
  const startBook = books.filter((x) => x.genre === genre)[Number(start.get('book')) - 1];
  if (startBook) selected[genre] = startBook.i;
  setGenre(genre);
  off.push(() => { const url = new URL(location.href); url.searchParams.delete('genre'); url.searchParams.delete('book'); history.replaceState(history.state, '', url.pathname + url.search + url.hash); });
  return () => off.forEach((fn) => fn());
  };

  window.shelfInit = init;
  init(document);
})();
