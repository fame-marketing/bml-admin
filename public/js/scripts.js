;(function (w,d){

  let tabButtons = d.querySelectorAll('.adminSection_tab');

  function adminSectionTabs() {

    tabButtons.forEach(btn => {
      btn.addEventListener('click', swapTab)
    });

  }

  function swapTab(e) {
    const targetSection = e.target.dataset.tab,
          allSections = d.getElementsByClassName('adminContent_swap')
    ;

    console.log(allSections.length);

    for(let i = 0; i < allSections.length; i++) {
      const section = allSections[i];
      if (section.dataset.swap !== targetSection) {
        section.dataset.visibility = 'hidden';
      } else if (section.dataset.swap === targetSection) {
        section.dataset.visibility = 'visible';
      }
    }

  }

  if (tabButtons.length > 0) {
    adminSectionTabs();
  }

})(window, document);
