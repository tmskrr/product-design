const views = {
  dashboard: {
    kicker: 'Рабочая точка входа',
    title: 'Главный экран показывает текущую ситуацию',
    copy: 'Здесь собраны ближайшие записи, загрузка, свободные окна, события и задачи. Администратор видит, что требует внимания, и сразу переходит к нужному действию',
    src: './assets/images/flowup/dashboard-light.png',
    alt: 'Главный экран FlowUp',
    caption: 'Главный экран · текущая ситуация и быстрые переходы'
  },
  calendar: {
    kicker: 'Работа с расписанием',
    title: 'Масштаб календаря меняется вместе с задачей',
    copy: 'Администратору важно работать с конкретными записями и оценивать загрузку на более длинном отрезке. Поэтому календарь сохраняет одну структуру, но даёт несколько масштабов расписания',
    src: './assets/images/flowup/calendar-week.png',
    alt: 'Недельный календарь FlowUp',
    caption: 'Неделя · распределение записей и загрузка сотрудников'
  },
  clients: {
    kicker: 'Работа с клиентами',
    title: 'Представление зависит от рабочего действия',
    copy: 'Список помогает быстро найти человека, проверить основные данные и перейти к записи или другому связанному действию',
    src: './assets/images/flowup/clients-dark.png',
    alt: 'Список клиентов FlowUp',
    caption: 'Список · ключевые данные и переход к действию'
  },
  tasks: {
    kicker: 'Контроль текущей работы',
    title: 'Задачи под разные режимы работы',
    copy: 'Доска показывает движение по статусам, список помогает быстро просмотреть текущие дела, а карточка раскрывает детали одной задачи',
    src: './assets/images/flowup/tasks-dark.png',
    alt: 'Доска задач FlowUp',
    caption: 'Доска · задачи по статусам'
  }
};

document.querySelectorAll('[data-option]').forEach((option) => {
  const tabs = [...option.querySelectorAll('[data-view]')];
  const figure = option.querySelector('figure');
  const select = (tab) => {
    const view = views[tab.dataset.view];
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    figure.classList.add('is-changing');
    window.setTimeout(() => {
      option.querySelector('[data-kicker]').textContent = view.kicker;
      option.querySelector('[data-title]').textContent = view.title;
      option.querySelector('[data-copy]').textContent = view.copy;
      const image = option.querySelector('[data-image]');
      image.src = view.src;
      image.alt = view.alt;
      option.querySelector('[data-caption]').textContent = view.caption;
      figure.classList.remove('is-changing');
    }, 120);
  };
  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab)));
  option.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    tabs[next].focus();
    select(tabs[next]);
  });
});
