document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("infoModal");
  const closeModal = document.querySelector(".close");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const modalMiles = document.getElementById("modalMiles");
  const modalColor = document.getElementById("modalColor");
  const modalName = document.getElementById("modalName");

  const infoButtons = document.querySelectorAll(".btnInfo");

  infoButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const itemInfo = JSON.parse(this.getAttribute("data-info"));

      modalName.textContent = itemInfo.inv_make + " " + itemInfo.inv_model;
      modalImage.src = itemInfo.inv_image;
      modalDescription.textContent = itemInfo.inv_description;
      modalMiles.textContent =
        new Intl.NumberFormat("en-US").format(itemInfo.inv_miles) + " miles";
      modalColor.textContent = itemInfo.inv_color;

      modal.classList.remove("hidden");
      modal.style.display = "block";
    });
  });

  closeModal.addEventListener("click", function () {
    modal.classList.add("hidden");
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
  });
});
