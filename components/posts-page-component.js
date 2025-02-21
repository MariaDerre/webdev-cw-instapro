import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, user, getToken } from "../index.js";
import { getPosts, likePostActive, likePostDislike } from "../api.js";
import { formatDistance } from 'date-fns';
import  { ru }  from 'date-fns/locale'
import { sanitizeHTML } from "../helpers.js";

export let posts = [];

export const fetchGetPosts = () => {
  getPosts().then((responseData) => {
    posts = responseData.posts.map(post => {
      return {
        postId: post.id,
        imageUrl: post.imageUrl,
        date: formatDistance(new Date(), new Date(post.createdAt), {locale: ru}),
        description: post.description,
        user:{
          idUser: post.user.id,
          name: post.user.name,
          login: post.user.login,
          imageUrlUser: post.user.imageUrlUser
        },
        likes: post.likes,
        isLiked: post.isLiked || false,
      };
    })
    renderPostsPageComponent({ appEl: document.getElementById('app'), posts });
  })
  .catch((error) => {
    console.error("Ошибка при получении постов:", error);
  });  
}

export function renderPostsPageComponent({ appEl, posts }) {
  const postsHtml = posts.map((post, index) => {
    return `
          <li data-index="${index} class="post">
            <div class="post-header" data-user-id="${post.user.idUser}">
                <img src="${post.user.imageUrlUser}" class="post-header__user-image">
                <p class="post-header__user-name">${sanitizeHTML(post.user.name)}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${post.postId}" data-index="${index}" data-like="${post.isLiked}" class='like-button' ${post.isLiked}>
              <img src="assets/images/${post.isLiked ? "like-active.svg" : "like-not-active.svg"}"> 
              </button>
              </button>
              <p class="post-likes-text">
              Нравится: <strong>${post.likes.length > 1 ? post.likes.at(-1).name + " и еще " + (post.likes.length - 1) : post.likes.length === 1 ? post.likes.at(-1).name : "0"}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${sanitizeHTML(post.user.name)}</span>
              ${sanitizeHTML(post.description)}
            </p>
            <p class="post-date">
            ${post.date}
            </p>
          </li>`
  }).join("");

  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                  ${postsHtml}
                </ul>
              </div>`;

  appEl = document.getElementById('app');
  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (const button of document.querySelectorAll(".like-button")) {
    button.addEventListener('click', () => {
      const id = button.dataset.postId;
      const index = button.dataset.index;
      if (!getToken()) {
        alert("Лайкать посты могут только авторизованные пользователи")    
        return;   
      }
      if (user) {
        if (posts[index].isLiked === false) {
          likePostActive({ id })
          .then((response) => {
          posts[index].isLiked = true;
          posts[index].likes.push({
            id: response.post.likes.at(-1).id,
            name: response.post.likes.at(-1).name,
          })
            renderPostsPageComponent({appEl, posts});
          })
  
        } else {
          posts[index].isLiked = false;
          posts[index].likes.pop();
          likePostDislike({ id })
          .then((response) => {
            renderPostsPageComponent({appEl, posts});
          })  
        }
      }
    })
  }

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
  const userId = userEl.dataset.userId
  let userPosts = [];
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].user.idUser == userId) {         
      userPosts.push(posts[i]);
    }
  }

  renderUserPosts()

  function renderUserPosts() {
    const userPostHtml = userPosts.map((post, index) => {
      return `
            <li data-index="${index}" class="post" >
              <div class="post-image-container">
                <img class="post-image" src="${post.imageUrl}">
              </div>
              <div class="post-likes">
                <button data-post-id="${post.postId}" data-index=${index} class="like-button" ${post.isLiked}>
                <img src="assets/images/${post.isLiked ? "like-active" : "like-not-active"}.svg">
                </button>
                <p class="post-likes-text">
                  Нравится: <strong>${post.likes.length > 1 ? post.likes.at(-1).name + " и еще " + (post.likes.length - 1) : post.likes.length === 1 ? post.likes.at(-1).name : "0"}</strong>
                </p>
              </div>
              <p class="post-text">
                <span class="user-name">${sanitizeHTML(post.user.name)}</span>
                ${sanitizeHTML(post.description)}
              </p>
              <p class="post-date">
              ${post.date}
              </p>
            </li>`
    }).join("");

  const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
          <div class="post-header" data-user-id="${userPosts[0].user.idUser}">
            <img src="${userPosts[0].user.imageUrlUser}" class="post-header__user-image user-post-image">
            <p class="post-header__user-name">${sanitizeHTML(userPosts[0].user.name)}</p>
          </div>
        <ul class="posts">
          ${userPostHtml}
        </ul>
      </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),  
    }); 

    for (const button of document.querySelectorAll(".like-button")) {
      button.addEventListener('click', () => {    
        const id = button.dataset.postId;
        const index = button.dataset.index;
        if (!getToken()) {
          alert("Лайкать посты могут только автризованные пользователи")    
          return;
        }
        if (user) {
          if (userPosts[index].isLiked === false) {  
            likePostActive({ id }).then((response) => {             
            userPosts[index].isLiked = true;
            userPosts[index].likes.push({     
              id: response.post.likes.at(-1).id,
              name: response.post.likes.at(-1).name,     
            })      
              renderUserPosts();               
            })      
          } else {     
            userPosts[index].isLiked = false;
            userPosts[index].likes.pop();     
            likePostDislike({ id }).then((response) => {
              renderUserPosts();     
            })              
          }           
        }    
      })    
    } 
  }
})
}
}