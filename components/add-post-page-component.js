import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";
import {addPost} from "../api.js"

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    const appHtml = `
    <div class="page-container">
          <div class="header-container"></div>
          <div class="form">
              <h3 class="form-title">Добавить пост</h3>
              <div class="form-inputs">
                      <div class="upload-image-container"></div>
                      <p>Опишите фотографию</p>
                      <textarea rows='5' id="description" class="textarea"/></textarea>
                    <button class="button" id="add-button">Добавить</button>
              </div>
          </div>
      </div> 
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });
    
    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container")
    });

    document.getElementById("add-button").addEventListener("click", () => {

      if (document.querySelector(".file-upload-image") == null) {
        alert("Загрузите, пожалуйста, изображение");
        return;       
      }
      if (document.querySelector(".textarea").value == "") {
        alert("Добавьте, пожалуйста, описание");
        return;
      }
      onAddPostClick(
        addPost(
          document.querySelector(".textarea").value,
          document.querySelector(".file-upload-image").src,) 
      );
    });
  };
  render();
}

