;(function (w,d){

  function validatePage(e) {

    const req = new XMLHttpRequest(),
      url = encodeURI(e.target.dataset.url),
      data = "url=" + url
    ;

    req.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        if (req.responseText === "verified") {
          const btn = e.target;
          btn.disabled = true;
          btn.classList.add('verified');
          btn.innerText = "Verified";
        } else {
          console.log("there was an error while attempting to validate the page. Please check connection to the database");
        }
      }
    };

    req.open('POST', '/nn-admin', true);

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
