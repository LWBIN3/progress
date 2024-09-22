let currentPage = 1; // 當前頁數
let limit = 25; // 每頁顯示的資料數，現在可以變動
let totalPages = 672;
let data;

// 當頁面加載完成時，初始化控件並獲取資料
document.addEventListener("DOMContentLoaded", () => {
  initializeControls();
  loadMaterials(currentPage);
});

function initializeControls() {
  const gotoPageSelect = document.getElementById("gotoPage");
  const itemsPerPageSelect = document.getElementById("itemsPerPage");
  const prevButton = document.getElementById("previousPage");
  const nextButton = document.getElementById("nextPage");

  // 初始化 "Go to page" 下拉選單
  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Page ${i}`;
    gotoPageSelect.appendChild(option);
  }

  // 設置事件監聽器
  gotoPageSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      currentPage = parseInt(e.target.value);
      loadMaterials(currentPage);
    }
  });

  itemsPerPageSelect.addEventListener("change", (e) => {
    limit = parseInt(e.target.value);
    currentPage = 1; // 重置到第一頁
    loadMaterials(currentPage);
  });

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadMaterials(currentPage);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadMaterials(currentPage);
    }
  });
}

// 獲取資料並顯示在表格中
async function loadMaterials(page) {
  try {
    const response = await fetch(`/api/materials?page=${page}&limit=${limit}`);
    data = await response.json(); // 更新全局变量 data
    const pageshow = data.page;
    const pagetotal = data.totalPages;
    currentPage = pageshow; // 確保 currentPage 與後端返回的頁碼同步
    totalPages = pagetotal; // 更新總頁數

    const pagetext = document.querySelector(".pagetext");
    pagetext.innerHTML = `We have ${pagetotal} pages and now you are in page ${pageshow}`;

    updatePagination();
    updateGotoPageSelect();

    if (data && data.data.length > 0) {
      displayMaterials(data.data);
    } else {
      console.log("No data found");
    }
  } catch (error) {
    console.error("Error fetching materials:", error);
  }
}

function updatePagination() {
  const downsidepage = document.querySelector(".pagination");
  downsidepage.innerHTML = "";

  // 計算要顯示的頁碼範圍
  // let startPage, endPage;
  // if (totalPages <= 5) {
  //   startPage = 1;
  //   endPage = totalPages;
  // } else {
  //   if (currentPage <= 3) {
  //     startPage = 1;
  //     endPage = 5;
  //   } else if (currentPage + 2 >= totalPages) {
  //     startPage = totalPages - 4;
  //     endPage = totalPages;
  //   } else {
  //     startPage = currentPage - 2;
  //     endPage = currentPage + 2;
  //   }
  // }

  // 更新 Previous 按鈕狀態
  const prevButton = document.getElementById("previousPage");
  prevButton.disabled = currentPage === 1;
  prevButton.classList.toggle("disabled-button", currentPage === 1);

  // 更新 Next 按鈕狀態
  const nextButton = document.getElementById("nextPage");
  nextButton.disabled = currentPage === totalPages;
  nextButton.classList.toggle("disabled-button", currentPage === totalPages);

  // 生成頁碼按鈕
  // for (let i = startPage; i <= endPage; i++) {
  //   const pageButton = document.createElement("button");
  //   pageButton.textContent = i;
  //   pageButton.classList.add("page-item");
  //   if (i === currentPage) {
  //     pageButton.classList.add("active");
  //   }
  //   pageButton.addEventListener("click", () => {
  //     loadMaterials(i);
  //   });
  //   downsidepage.appendChild(pageButton);
  // }
}

function updateGotoPageSelect() {
  const gotoPageSelect = document.getElementById("gotoPage");
  gotoPageSelect.innerHTML = '<option value="">Go to page...</option>';
  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Page ${i}`;
    if (i === currentPage) {
      option.selected = true;
    }
    gotoPageSelect.appendChild(option);
  }
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

// 將資料顯示在表格中
function displayMaterials(materials) {
  const materialList = document.getElementById("MaterialList");
  materialList.innerHTML = ""; // 清空表格

  materials.forEach((material) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${
        material.folder
          ? convertToSubscript(material.folder.split("/").pop().split("-")[0])
          : "-"
      }</td>
      <td>${material.ehull ? material.ehull.toFixed(3) : "-"}</td>
      <td>${material.hform ? material.hform.toFixed(3) : "-"}</td>
      <td>${material.gap ? material.gap.toFixed(3) : "-"}</td>
      <td>${material.magstate || "-"}</td>
      <td>${material.layergroup || "-"}</td>
    `;
    materialList.appendChild(row);
  });
}
