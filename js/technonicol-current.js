(() => {
  const navItems = [
    ['workspace', 'Главная'],
    ['company', 'Компания'],
    ['documents', 'Документы'],
    ['learning', 'Обучение'],
    ['services', 'Сервисы']
  ];

  const workspace = () => `
    <div class="tech-home-heading"><div><small>Главная</small><h3>Рабочее пространство сотрудника</h3><p>Корпоративная информация и доступные сервисы</p></div><span>Обновлено сегодня</span></div>
    <div class="tech-home-feature"><article class="tech-home-lead"><small>ВАЖНОЕ</small><h4>Обновление корпоративной информации</h4><p>Актуальное объявление для сотрудников и подразделений.</p><span>Открыть материал</span></article><aside><small>ДЛЯ ВАШЕЙ РОЛИ</small><b>Назначено обучение</b><p>Текущий материал доступен в разделе «Обучение»</p><span>Продолжить</span></aside></div>
    <div class="tech-home-shortcuts"><article><small>ДОКУМЕНТЫ</small><b>Справки и рабочие материалы</b><span>Перейти</span></article><article><small>ОБУЧЕНИЕ</small><b>Назначенные материалы</b><span>Продолжить</span></article><article><small>ОПРОСЫ</small><b>Обратная связь</b><span>Открыть</span></article><article><small>КОМПАНИЯ</small><b>Структура и сотрудники</b><span>Найти</span></article></div>
    <div class="tech-home-grid">
      <section><header><h4>Корпоративный журнал</h4><span>Все материалы</span></header><article><small>Сегодня</small><b>Изменения в структуре компании</b><p>Информация для сотрудников и подразделений.</p></article><article><small>На этой неделе</small><b>Новости подразделений</b><p>Рабочие объявления внутренних команд.</p></article></section>
      <aside><h4>Полезное</h4><span>Справочник сотрудников</span><span>Структура компании</span><span>Документы и знания</span><span>Полезные контакты</span><span>Опросы</span></aside>
    </div>`;

  const documents = () => `
    <div class="tech-documents-head"><div><small>Документы</small><h3>Документы и рабочие действия</h3><p>Состав раздела зависит от роли, подразделения и доступа</p></div><div class="tech-documents-context"><span>Рабочий контекст</span><b>Производственное подразделение · специалист</b></div></div>
    <label class="tech-document-search"><span class="icon" data-icon="search" aria-hidden="true"></span><input type="search" placeholder="Найти документ" data-document-search></label>
    <div class="tech-local-tabs"><span class="is-active">Все</span><span>Кадровые</span><span>Рабочие документы</span><span>Документы подразделения</span></div>
    <div class="tech-document-catalog" data-filter-list><div class="tech-document-catalog__head"><span>Название</span><span>Тип</span><span>Доступ</span><span>Связанный процесс</span><span>Действие</span></div>
      <article data-title="кадровый документ заказать справку"><div><span class="icon" data-icon="book-open" aria-hidden="true"></span><b>Справка для сотрудника</b></div><small>Справка</small><span>Доступно</span><span>Запрос документа</span><button type="button">Заказать</button></article>
      <article data-title="рабочий документ регламент подразделения"><div><span class="icon" data-icon="book-open" aria-hidden="true"></span><b>Регламент подразделения</b></div><small>Регламент</small><span>По роли</span><span>Рабочий процесс</span><button type="button">Открыть</button></article>
      <article data-title="документ подразделения инструкция"><div><span class="icon" data-icon="book-open" aria-hidden="true"></span><b>Рабочая инструкция</b></div><small>Инструкция</small><span>По подразделению</span><span>Текущая задача</span><button type="button">Открыть</button></article>
      <article data-title="шаблон документа"><div><span class="icon" data-icon="book-open" aria-hidden="true"></span><b>Шаблон документа</b></div><small>Шаблон</small><span>Доступно</span><span>Подготовка документа</span><button type="button">Скачать</button></article>
    </div>
    <section class="tech-my-requests"><header><div><small>МОИ ЗАПРОСЫ</small><h4>История и текущие статусы</h4></div><span>Показать все</span></header><div class="tech-request-head"><span>Запрос</span><span>Дата</span><span>Статус</span><span>Нужно действие</span><span>Дальше</span></div><article><b>Справка для сотрудника</b><time>Сегодня</time><em class="is-progress">На рассмотрении</em><span>Нет</span><span>Дождаться результата</span></article><article><b>Рабочий документ</b><time>Вчера</time><em class="is-action">Нужны данные</em><span>Да · уточнить</span><span>Открыть запрос</span></article><article><b>Документ подразделения</b><time>Ранее</time><em class="is-done">Готово</em><span>Нет</span><span>Открыть результат</span></article></section>`;

  const profile = () => `
    <div class="tech-profile-heading"><div class="tech-profile-person"><span>С</span><div><small>Личный кабинет</small><h3>Сотрудник компании</h3><p>Специалист · Производственное подразделение</p></div></div><button type="button">Редактировать контакты</button></div>
    <div class="tech-profile-actions"><article><small>ДОКУМЕНТЫ</small><b>Мои документы</b><span>Открыть</span></article><article><small>СПРАВКИ</small><b>Заказать справку</b><span>Перейти</span></article><article><small>ЗАПРОСЫ</small><b>Мои запросы</b><span>Проверить статус</span></article><article><small>ОБУЧЕНИЕ</small><b>Назначенные материалы</b><span>Продолжить</span></article></div>
    <div class="tech-profile-layout"><section><h4>Рабочие данные</h4><dl><div><dt>Подразделение</dt><dd>Производственное подразделение</dd></div><div><dt>Должность</dt><dd>Специалист</dd></div><div><dt>Рабочий телефон</dt><dd>Внутренний номер</dd></div><div><dt>Почта</dt><dd>Рабочий адрес</dd></div></dl></section><aside><small>СТРУКТУРА</small><h4>Производственное подразделение</h4><div class="tech-team-tree"><div><span>Р</span><p><small>Руководитель</small><b>Руководитель подразделения</b></p></div><div><span>К</span><p><small>Команда</small><b>Сотрудники подразделения</b></p></div></div><button type="button">Открыть структуру</button></aside></div>`;

  const scope = () => `
    <div class="tech-scope-heading"><div><small>Моя зона</small><h3>Знания, обучение и действия внутри рабочих сценариев</h3><p>Материалы зависели от контекста сотрудника и сохраняли связь с дальнейшим действием.</p></div><span>МОЯ ЗОНА</span></div>
    <div class="tech-scope-preview"><article><small>ДОКУМЕНТЫ И ЗНАНИЯ</small><b>Материалы и справки</b><p>Правила, инструкции и ответы в контексте рабочей задачи</p><span>Открыть</span></article><article><small>ОБУЧЕНИЕ И ОНБОРДИНГ</small><b>Назначенная последовательность</b><p>Материал, следующий шаг и возврат к работе</p><span>Продолжить</span></article><article><small>ЗАПРОСЫ И ОПРОСЫ</small><b>Действия и состояния</b><p>Отправка, статус, обратная связь и результат</p><span>Посмотреть</span></article></div>`;

  const material = () => `
    <div class="tech-breadcrumb">Документы / Рабочая инструкция</div>
    <div class="tech-material-screen"><article><small>ИНСТРУКЦИЯ · ДОСТУП ПО РОЛИ</small><h3>Порядок работы с внутренними документами</h3><p>Что нужно проверить перед оформлением запроса.</p><ol><li>Выберите документ для текущей задачи</li><li>Проверьте необходимые данные</li><li>Откройте связанную форму</li></ol><div class="tech-material-file"><span class="icon" data-icon="book-open" aria-hidden="true"></span><div><small>СВЯЗАННЫЙ МАТЕРИАЛ</small><b>Рабочая инструкция</b></div><span>Открыть · скачать</span></div></article><aside><small>ДОСТУПНОЕ ДЕЙСТВИЕ</small><h4>Заказать справку</h4><p>Запрос появится в разделе «Мои запросы».</p><button type="button">Открыть форму</button></aside></div>`;

  const request = () => `
    <div class="tech-breadcrumb">Документы / Запросить справку</div>
    <div class="tech-request-layout"><form><small>ЗАПРОС ДОКУМЕНТА</small><h3>Справка для сотрудника</h3><p>Срок обработки — согласно регламенту.</p><label><span>Тип документа</span><div>Справка для сотрудника</div></label><label><span>Период</span><div>Выбранный период</div></label><label><span>Комментарий</span><div class="is-input">Добавить при необходимости</div></label><footer><button type="button">Отменить</button><button class="tech-primary" type="button">Отправить запрос</button></footer></form><aside><small>ПОСЛЕ ОТПРАВКИ</small><h4>Запрос появится в «Моих запросах»</h4><ul><li>текущий статус;</li><li>требуется ли действие;</li><li>доступное продолжение.</li></ul></aside></div>`;

  const status = () => `
    <div class="tech-breadcrumb">Документы / Мои запросы / Справка для сотрудника</div>
    <div class="tech-status-layout"><section><small>ТРЕБУЕТСЯ ДЕЙСТВИЕ</small><h3>Нужны дополнительные данные</h3><p>Для подготовки документа не хватает данных. Дополните запрос, чтобы вернуть его на рассмотрение.</p><dl><div><dt>Причина</dt><dd>Не хватает данных</dd></div><div><dt>Текущий этап</dt><dd>Запрос приостановлен</dd></div><div><dt>После дополнения</dt><dd>Снова на рассмотрении</dd></div></dl><button class="tech-primary" type="button">Дополнить данные</button></section><aside><span>Отправлено</span><span>На рассмотрении</span><span class="is-current is-return">Нужны данные ↺</span><span class="is-repeat">Снова на рассмотрении</span><span>Готово</span></aside></div>`;

  const submitted = () => `
    <div class="tech-documents-head"><div><small>Документы / Мои запросы</small><h3>Запрос отправлен</h3><p>Статус и дальнейшее действие остаются в том же разделе</p></div><div class="tech-documents-context"><span>Последнее изменение</span><b>Только что</b></div></div>
    <section class="tech-my-requests tech-my-requests--focus"><header><div><small>МОИ ЗАПРОСЫ</small><h4>Справка для сотрудника</h4></div><span>Запрос создан</span></header><div class="tech-request-head"><span>Запрос</span><span>Статус</span><span>От сотрудника</span><span>Дальше</span></div><article><b>Справка для сотрудника</b><em class="is-progress">На рассмотрении</em><span>Действие не требуется</span><span>Дождаться изменения статуса</span></article></section><div class="tech-submitted-note"><small>ЧТО ПРОИЗОЙДЁТ ДАЛЬШЕ</small><p>При изменении статуса сотрудник получит уведомление и сможет вернуться к этому запросу.</p></div>`;

  const learning = () => `
    <div class="tech-learning-page"><div class="tech-ui-heading"><div><small>Обучение</small><h3>Назначенные материалы</h3></div><p>Для вашей роли и подразделения</p></div><ol><li class="is-done"><span>Материал</span><b>Введение в рабочую область</b><small>Пройдено</small></li><li class="is-current"><span>Инструкция</span><b>Порядок работы с внутренними документами</b><small>Текущий шаг</small></li><li><span>Продолжение</span><b>Вернуться к рабочей задаче</b><small>Следующий шаг</small></li></ol><div class="tech-learning-links"><span>Связанный документ</span><span>Внутренняя инструкция</span><button type="button">Открыть материал</button></div></div>`;

  const ready = () => `
    <div class="tech-breadcrumb">Документы / Мои запросы / Справка для сотрудника</div>
    <div class="tech-ready-layout"><section><small>РЕЗУЛЬТАТ ГОТОВ</small><h3>Документ доступен</h3><p>Сотрудник видит итог процесса и может открыть результат или вернуться к рабочей задаче.</p><div class="tech-ready-file"><span class="icon" data-icon="book-open" aria-hidden="true"></span><div><b>Справка для сотрудника</b><small>Результат запроса</small></div><button type="button">Открыть</button></div><footer><button type="button">Вернуться к работе</button><button class="tech-primary" type="button">Скачать результат</button></footer></section><aside><span>Запрос отправлен</span><span>На рассмотрении</span><span>Проверка данных</span><span class="is-current">Готово</span></aside></div>`;

  const learningMaterial = () => `
    <div class="tech-breadcrumb">Обучение / Назначенные материалы / Рабочая инструкция</div>
    <div class="tech-learning-material"><article><small>ТЕКУЩИЙ МАТЕРИАЛ</small><h3>Порядок работы с внутренними документами</h3><p>Материал последовательно объясняет рабочий контекст и связывает знания с дальнейшим действием.</p><div class="tech-learning-content"><b>Что нужно знать</b><span>Условия и роли внутри процесса</span><b>Порядок действий</b><span>Последовательность для текущей задачи</span><b>Связанный материал</b><span>Внутренняя инструкция</span></div></article><aside><small>ДАЛЬШЕ</small><h4>Перейти к следующему шагу</h4><p>Продолжение становится доступно после знакомства с материалом.</p><button type="button">Продолжить</button></aside></div>`;

  const learningNext = () => `
    <div class="tech-breadcrumb">Обучение / Следующий шаг</div>
    <div class="tech-learning-next"><section><small>МАТЕРИАЛ ЗАВЕРШЁН</small><h3>Вернуться к исходной задаче</h3><p>Назначенная последовательность завершена.</p><div><b>Изученный материал</b><span>Порядок работы с внутренними документами</span></div><div><b>Контекст возврата</b><span>Раздел документов</span></div><button class="tech-primary" type="button">Вернуться к задаче</button></section></div>`;

  const surveyList = () => `
    <div class="tech-survey-page"><div class="tech-ui-heading"><div><small>Опросы</small><h3>Доступные опросы</h3></div><p>Для текущей роли и подразделения</p></div><div class="tech-local-tabs"><span class="is-active">Все</span><span>Пройденные</span><span>Непройденные</span><span>Завершённые</span></div><div class="tech-survey-list"><article><div><small>ОБРАТНАЯ СВЯЗЬ</small><b>Опрос для сотрудников</b><p>Статус · Не пройден</p></div><button type="button">Пройти</button></article><article><div><small>ОБРАТНАЯ СВЯЗЬ</small><b>Рабочая тема</b><p>Статус · Пройден</p></div><span>Открыть</span></article></div></div>`;

  const surveyForm = () => `
    <div class="tech-survey-page"><div class="tech-breadcrumb">Опросы / Обратная связь</div><div class="tech-survey-form"><small>ВОПРОС</small><h3>Что в рабочем процессе требует уточнения?</h3><p>Опишите ситуацию и укажите, на каком этапе возник вопрос.</p><label><span>Ответ сотрудника</span><textarea aria-label="Ответ сотрудника" placeholder="Введите ответ"></textarea></label><footer><button type="button">Назад</button><button class="tech-primary" type="button">Отправить</button></footer></div></div>`;

  const screens = { workspace, profile, scope, documents, material, request, submitted, status, ready, learning, learningMaterial, learningNext, surveyList, surveyForm };
  const notificationMarkup = `<aside class="tech-notification-popover" data-notifications-panel><header><b>Уведомления</b><button type="button" data-notifications-close aria-label="Закрыть">×</button></header><article><small>Сейчас</small><strong>Для запроса нужны дополнительные данные</strong><a href="#tech-request">Перейти к запросу</a></article></aside>`;

  const portal = (screen) => {
    const active = ['material', 'request', 'submitted', 'status', 'ready', 'scope'].includes(screen) ? 'documents' : ['learning', 'learningMaterial', 'learningNext', 'surveyList', 'surveyForm'].includes(screen) ? 'learning' : screen === 'profile' ? '' : screen;
    const nav = navItems.map(([id, label]) => `<span class="${id === active ? 'is-active' : ''}">${label}</span>`).join('');
    const bell = screen === 'status'
      ? `<button class="tech-portal__bell" type="button" data-notifications-toggle aria-expanded="true" aria-label="Открыть уведомления"><span class="icon" data-icon="bell" aria-hidden="true"></span><b>2</b></button>`
      : `<span class="tech-portal__bell" aria-hidden="true"><span class="icon" data-icon="bell"></span><b>2</b></span>`;
    const notifications = screen === 'status' ? notificationMarkup : '';
    return `<header class="tech-portal__header"><div class="tech-portal__brand"><img src="./assets/images/technonicol/logo.svg" alt=""><div><b>Корпоративный портал</b><span>Внутренняя рабочая среда</span></div></div><label class="tech-portal__search"><span class="icon" data-icon="search" aria-hidden="true"></span><input type="search" placeholder="Поиск по порталу" aria-label="Поиск по порталу"></label><div class="tech-portal__utilities">${bell}<div class="tech-portal__profile ${screen === 'profile' ? 'is-active' : ''}"><span>С</span><div><b>Сотрудник</b><small>Производственное подразделение</small><em>Специалист</em></div></div></div></header><nav class="tech-portal__topnav" aria-label="Разделы портала">${nav}</nav><div class="tech-portal__frame"><div class="tech-portal__content">${screens[screen]()}</div></div>${notifications}`;
  };

  const hydratePortal = (node) => {
    node.querySelectorAll('[data-icon]').forEach((icon) => window.renderSiteIcon?.(icon));
    const filter = () => {
      const query = node.querySelector('[data-document-search]')?.value.trim().toLocaleLowerCase('ru') || '';
      node.querySelectorAll('[data-filter-list] article').forEach((item) => { item.hidden = Boolean(query) && !item.dataset.title.includes(query); });
    };
    node.querySelector('[data-document-search]')?.addEventListener('input', filter);
  };

  document.querySelectorAll('[data-portal-screen]').forEach((node) => {
    const screen = node.dataset.portalScreen;
    if (!screens[screen]) return;
    node.innerHTML = portal(screen);
    hydratePortal(node);
  });

  document.querySelectorAll('[data-designer-switcher]').forEach((switcher) => {
    const portalNode = switcher.querySelector('[data-designer-portal]');
    const caption = switcher.querySelector('[data-designer-caption]');
    const captions = {
      workspace: 'Соседняя зона дизайнера · Главная, журнал и корпоративные точки входа',
      profile: 'Соседняя зона дизайнера · Профиль и структура задавали персональный контекст сотрудника',
      scope: 'Моя зона ответственности · Внутренние знания, документы, обучение, онбординг и связанные рабочие сценарии'
    };
    const render = (screen) => {
      portalNode.innerHTML = portal(screen);
      hydratePortal(portalNode);
      caption.textContent = captions[screen];
      switcher.querySelectorAll('[data-designer-screen]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.designerScreen === screen)));
    };
    render('workspace');
    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-designer-screen]');
      if (button) render(button.dataset.designerScreen);
    });
  });

  document.querySelectorAll('[data-screen-showcase]').forEach((showcase) => {
    const portalNode = showcase.querySelector('[data-showcase-portal]');
    const caption = showcase.querySelector('[data-showcase-caption]');
    const captions = {
      documents: 'Каталог — доступные материалы и история запросов в одном разделе',
      material: 'Документ — содержание и связанное действие',
      request: 'Форма — данные, срок и состояние после отправки',
      status: 'Статус — причина остановки и доступное действие',
      ready: 'Результат — готовый документ и завершение процесса',
      learning: 'Назначено — последовательность для роли и подразделения',
      learningMaterial: 'Материал — содержание и доступное продолжение',
      learningNext: 'Завершение — возврат в исходный раздел'
    };
    const render = (screen) => {
      if (!screens[screen]) return;
      portalNode.toggleAttribute('data-live', screen === 'status');
      portalNode.innerHTML = portal(screen);
      hydratePortal(portalNode);
      caption.textContent = captions[screen] || '';
      showcase.querySelectorAll('[data-showcase-screen]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.showcaseScreen === screen)));
    };
    render(showcase.dataset.initialScreen);
    showcase.addEventListener('click', (event) => {
      const button = event.target.closest('[data-showcase-screen]');
      if (button) render(button.dataset.showcaseScreen);
    });
  });

  document.querySelectorAll('[data-survey-showcase]').forEach((showcase) => {
    const portalNode = showcase.querySelector('[data-survey-portal]');
    const caption = showcase.querySelector('[data-survey-caption]');
    const captions = {
      surveyList: 'Доступные опросы — название, тип, статус и действие',
      surveyForm: 'Прохождение — вопрос, ответ и отправка'
    };
    const render = (screen) => {
      portalNode.innerHTML = portal(screen);
      hydratePortal(portalNode);
      caption.textContent = captions[screen];
      showcase.querySelectorAll('[data-survey-screen]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.surveyScreen === screen)));
    };
    render('surveyList');
    showcase.addEventListener('click', (event) => {
      const button = event.target.closest('[data-survey-screen]');
      if (button) render(button.dataset.surveyScreen);
    });
  });

  const opportunities = {
    ideas: { label: 'Предложение', title: 'Единый Банк идей', text: 'Для распределённой компании важно регулярно слышать сотрудников и не терять инициативы.', points: ['Все идеи / Мои идеи', 'поиск и фильтры', 'статус и история идеи', 'возможность предложить идею'] },
    career: { label: 'Предложение', title: 'Внутренний карьерный раздел', text: 'Помочь сотруднику видеть возможности внутри компании и понимать направления развития.', points: ['возможности внутри компании', 'понятный следующий шаг', 'поддержка внутренней мобильности'] },
    branches: { label: 'Предложение', title: 'Карта и список филиалов', text: 'Упростить понимание структуры распределённой компании и поиск нужных людей.', points: ['адрес и контакты', 'ответственные и сотрудники', 'переход внутрь филиала'] },
    library: { label: 'Направление исследования', title: 'Электронная библиотека', text: 'До проектирования нужно проверить, кто и в каких рабочих ситуациях будет пользоваться профессиональными материалами.', points: ['сценарии производства и офиса', 'зависимость материалов от роли', 'критерии актуальности контента'] },
    motivation: { label: 'Направление исследования', title: 'Механика признания и мотивации', text: 'Одинаковая механика может не подходить разным рабочим контекстам, поэтому сначала нужно определить полезные действия и релевантное вознаграждение.', points: ['роль → полезное действие', 'признание или материальная награда', 'проверка уместности баллов и рейтинга'] }
  };
  document.querySelectorAll('[data-opportunity-switcher]').forEach((switcher) => {
    const panel = switcher.querySelector('[data-opportunity-panel]');
    const render = (id) => {
      const item = opportunities[id];
      panel.innerHTML = `<small>${item.label}</small><h3>${item.title}</h3><p>${item.text}</p><ul>${item.points.map((point) => `<li>${point}</li>`).join('')}</ul>`;
      switcher.querySelectorAll('[data-opportunity]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.opportunity === id)));
    };
    render('ideas');
    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('[data-opportunity]');
      if (button) render(button.dataset.opportunity);
    });
  });

  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-notifications-toggle], [data-notifications-close]');
    if (!control) return;
    const root = control.closest('.tech-portal');
    const panel = root.querySelector('[data-notifications-panel]');
    const bell = root.querySelector('[data-notifications-toggle]');
    if (!panel || !bell) return;
    const open = control.hasAttribute('data-notifications-toggle') && panel.hidden;
    panel.hidden = !open;
    bell.setAttribute('aria-expanded', String(open));
  });
})();
