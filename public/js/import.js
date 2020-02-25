const wrapper = document.getElementById("inputWrapper"),
			selectE = wrapper.getElementsByTagName("select")[0],
			selectedDiv = document.createElement("div"),
			customOptions = document.createElement("div")
			; //create new DIVs that will contain the select box, custom select box, and each option.
	
	selectedDiv.setAttribute("id", "select-selected");
	selectedDiv.innerHTML = selectE.options[selectE.selectedIndex].innerHTML;
	wrapper.appendChild(selectedDiv);
	
	customOptions.setAttribute("id", "select-items");
	customOptions.setAttribute("class", "select-hide");
	
	for (let j = 0; j < selectE.length; j++) {

		/* For each option in the original select element,
		create a new DIV that will act as an option item: */
		let option = document.createElement("div");
		option.innerHTML = selectE.options[j].innerHTML; // current option
		
		option.addEventListener("click", function(e) {
			/* When an item is clicked, update the original select box,
			and the selected item: */
			let same, ogSelect, customSelected;
			ogSelect = this.parentNode.parentNode.getElementsByTagName("select")[0];
			customSelected = this.parentNode.previousSibling;
			for (let i = 0; i < ogSelect.length; i++) {
				if (ogSelect.options[i].innerHTML == this.innerHTML) {
					ogSelect.selectedIndex = i;
					customSelected.innerHTML = this.innerHTML;
					same = this.parentNode.getElementsByClassName("same-as-selected");
					for (let k = 0; k < same.length; k++) {
						same[k].removeAttribute("class");
					}
					this.setAttribute("class", "same-as-selected");
					break;
				}
			}
			customSelected.click();
		});
		customOptions.appendChild(option);
	}
	
	wrapper.appendChild(customOptions);
	
	selectedDiv.addEventListener("click", function(e) {
		/* When the select box is clicked, close any other select boxes,
		and open/close the current select box: */
		e.stopPropagation();
		closeAllSelect(this);
		
		this.nextSibling.classList.toggle("select-hide");
		this.classList.toggle("select-arrow-active");
	});
	

function closeAllSelect(box) {
	
	let customBox = document.getElementById("select-items"),
			customSelected = document.getElementById("select-selected");
	if (box !== customSelected) {
		customSelected.classList.remove("select-arrow-active");
		customBox.classList.add("select-hide");
	}
	
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);

const fileEl = document.getElementById('file');

fileEl.addEventListener('change', (e) => {
	
	const value = e.target["value"],
				values = value.split('\\'),
				basename = values.pop();
	
	e.target.previousElementSibling.innerHTML = basename;
	
});