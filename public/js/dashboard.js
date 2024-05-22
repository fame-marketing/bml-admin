;(function (w,d){

  function validatePage(e) {

    const req = new XMLHttpRequest(),
      btn = e.target.closest('button'),
      url = encodeURI(btn.dataset.url),
      data = "url=" + url
    ;

    req.onreadystatechange = function() {

      if (this.readyState === 1) {

        btn.classList.add('processing');

      } else if (this.readyState === 4 && this.status === 200) {

        if (req.responseText === "verified") {
          btn.disabled = true;
          btn.classList.remove('processing');
          btn.classList.add('verified');
          btn.innerText = "Verified";
        } else {
          console.log("there was an error while attempting to validate the page. Please check connection to the database");
        }

      }

    };

    req.open('POST', '/fame-admin/nearby-now/', true);

    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    req.send(data);

  }

  const validateButtons = d.querySelectorAll('.validateBtn');

  if (validateButtons) {
    for (let i = 0; i < validateButtons.length; i++) {
      validateButtons[i].addEventListener('click', validatePage);
    }
  }

})(window, document);
