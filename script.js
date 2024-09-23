let allMaterials = []; // 儲存所有材料數據
let currentFilters = {
  magstate: "-",
  dyn_stab: "-",
  numbers: "-",
  minEnergy: "",
  maxEnergy: "",
};
let currentPage = 1;
let filteredMaterials = [];
let itemsPerPage = 25; // 或者您想要的默認值

document.addEventListener("DOMContentLoaded", () => {
  fetchMaterials();

  document.getElementById("magstate").addEventListener("change", updateFilters);
  document.getElementById("dyn_stab").addEventListener("change", updateFilters);
  document.getElementById("numbers").addEventListener("change", updateFilters);
  document
    .getElementById("min-energy")
    .addEventListener("input", updateFilters);
  document
    .getElementById("max-energy")
    .addEventListener("input", updateFilters);

  document.getElementById("itemsPerPage").addEventListener("change", () => {
    itemsPerPage = parseInt(document.getElementById("itemsPerPage").value);
    currentPage = 1;
    applyFilters();
  });

  document.getElementById("gotoPage").addEventListener("change", (e) => {
    currentPage = parseInt(e.target.value);
    displayMaterials(filteredMaterials);
  });

  document.getElementById("previousPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayMaterials(filteredMaterials);
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayMaterials(filteredMaterials);
    }
  });

  const searchMaterialInput = document.querySelector("[data-search]");
  searchMaterialInput.addEventListener("input", updateFilters);

  const searchStoichInput = document.querySelector("[data-stoich]");
  searchStoichInput.addEventListener("input", updateFilters);

  document.getElementById("goButton").addEventListener("click", applyFilters);
});

function updateFilters() {
  currentFilters.magstate = document.getElementById("magstate").value;
  currentFilters.dyn_stab = document.getElementById("dyn_stab").value;
  currentFilters.numbers = document.getElementById("numbers").value;
  currentFilters.searchMaterial = document.querySelector("[data-search]").value;
  currentFilters.searchStoich = document
    .querySelector("[data-stoich]")
    .value.toLowerCase();
  currentFilters.minEnergy = document.getElementById("min-energy").value;
  currentFilters.maxEnergy = document.getElementById("max-energy").value;
}

function applyFilters() {
  filteredMaterials = allMaterials;

  // 現有的篩選條件保持不變
  if (currentFilters.magstate !== "-") {
    filteredMaterials = filteredMaterials.filter(
      (material) => material.magstate === currentFilters.magstate
    );
  }

  if (currentFilters.dyn_stab !== "-") {
    filteredMaterials = filteredMaterials.filter(
      (material) => material.dyn_stab === currentFilters.dyn_stab
    );
  }

  if (currentFilters.numbers !== "-") {
    filteredMaterials = filteredMaterials.filter(
      (material) => counting(material) === parseInt(currentFilters.numbers)
    );
  }

  if (currentFilters.searchMaterial) {
    filteredMaterials = filteredMaterials.filter((material) =>
      material.folder
        .split("/")
        .pop()
        .split("-")[0]
        .includes(currentFilters.searchMaterial)
    );
  }

  if (currentFilters.searchStoich) {
    filteredMaterials = filteredMaterials.filter((material) =>
      material.folder
        .split("/")[6]
        .toLowerCase()
        .includes(currentFilters.searchStoich)
    );
  }

  // 添加能量範圍篩選
  if (currentFilters.minEnergy !== "") {
    filteredMaterials = filteredMaterials.filter(
      (material) => material.ehull >= parseFloat(currentFilters.minEnergy)
    );
  }

  if (currentFilters.maxEnergy !== "") {
    filteredMaterials = filteredMaterials.filter(
      (material) => material.ehull <= parseFloat(currentFilters.maxEnergy)
    );
  }
  let totalItems = filteredMaterials.length;
  let totalPages = Math.ceil(totalItems / itemsPerPage);
  currentPage = 1;
  updatePaginationControls(totalPages);
  displayMaterials(filteredMaterials);
}

function counting(material) {
  // 從 folder 路徑中提取化學式
  const chemicalFormula = material.folder.split("/")[6];

  // 使用正則表達式匹配所有大寫英文字母
  const regex = /[A-Z]/g;
  const matches = chemicalFormula.match(regex);

  // 返回大寫字母的數量，即化學物種的數量
  return matches ? matches.length : 0;
}

async function fetchMaterials() {
  try {
    const response = await fetch("/api/material");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allMaterials = await response.json();
    applyFilters(); // 這裡改變
  } catch (error) {
    console.error("Fetch error:", error);
    displayError("Error fetching materials data: " + error.message);
  }
}

function updatePaginationControls(totalPages) {
  const littlemssg = document.querySelector(".pagetext");
  let calcu = itemsPerPage * currentPage;
  let endRow = Math.min(filteredMaterials.length, calcu);
  littlemssg.innerHTML = `There are ${totalPages} pages, ${
    filteredMaterials.length
  } materials found, showing ${calcu - itemsPerPage + 1} - ${endRow} rows`;
  const gotoPageSelect = document.getElementById("gotoPage");
  gotoPageSelect.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Page ${i}`;

    if (i === currentPage) {
      option.selected = true;
    }
    gotoPageSelect.appendChild(option);
  }

  document.getElementById("previousPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

function displayMaterials(materials) {
  const materialList = document.getElementById("MaterialList");
  if (!materialList) {
    console.error("MaterialList element not found");
    return;
  }
  materialList.innerHTML = ""; // 清空表格

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = materials.slice(startIndex, endIndex);

  if (pageItems.length === 0) {
    materialList.innerHTML = `
    <tr>
        <td colspan="6">No match found</td>
    </tr>`;
  } else {
    pageItems.forEach((material) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${
          material.folder
            ? convertToSubscript(material.folder.split("/").pop().split("-")[0])
            : "-"
        }</td>
        <td>${material.ehull ? material.ehull.toFixed(3) : "."}</td>
        <td>${material.hform ? material.hform.toFixed(3) : "."}</td>
        <td>${material.gap !== undefined ? material.gap.toFixed(3) : "."}</td>
        <td>${material.magstate || "."}</td>
        <td>${material.layergroup || "."}</td>
      `;
      materialList.appendChild(row);
    });
  }

  updatePaginationControls(Math.ceil(materials.length / itemsPerPage));
}

function convertToSubscript(text) {
  const subscriptMap = {
    0: "₀",
    1: "₁",
    2: "₂",
    3: "₃",
    4: "₄",
    5: "₅",
    6: "₆",
    7: "₇",
    8: "₈",
    9: "₉",
  };

  return text.replace(/(\d+)/g, (match) => {
    return match
      .split("")
      .map((digit) => subscriptMap[digit] || digit)
      .join("");
  });
}

function displayError(message) {
  const materialList = document.getElementById("MaterialList");
  if (materialList) {
    materialList.innerHTML = `
      <tr>
        <td colspan="6">${message}</td>
      </tr>
    `;
  }
  const errorDiv = document.createElement("div");
  errorDiv.style.color = "red";
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}
