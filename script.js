document.addEventListener('DOMContentLoaded', () => {
    const switcherOptions = document.querySelectorAll('.switcher-option');
    const switcherSlider = document.querySelector('.switcher-slider');
  
    switcherOptions.forEach((option, index) => {
      option.addEventListener('click', () => {
        // Убираем активный класс у всех опций
        switcherOptions.forEach(opt => opt.classList.remove('active'));
        // Добавляем активный класс к выбранной опции
        option.classList.add('active');
        // Перемещаем слайдер
        switcherSlider.style.left = `${index * 33.3333}%`;
      });
    });
  });
    