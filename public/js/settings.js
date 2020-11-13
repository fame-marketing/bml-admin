;(function (w,d) {

  function scanForPages() {

    const req = new XMLHttpRequest(),
      data = "scan=true"
    ;

    req.onreadystatechange = () => {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log(req.responseText);
      }
    };

    req.onloadstart = () => {

    };

    req.open('POST', '/nn-admin/settings', true);

    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    req.send(data);

  }

  const scanBtn = d.getElementById('scanDirForPages');
  scanBtn.addEventListener('click', scanForPages); // make sure you cannot click this button again while it is already scanning for pages

})(window, document);
