let currentsongs = new Audio();
let Currfolder;
let songs;
async function getsongs(folder) {
  Currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5501/spotify/${Currfolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let names = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < names.length; i++) {
    const element = names[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songsul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songsul.innerHTML = "";
  for (const song of songs) {
    songsul.innerHTML =
      songsul.innerHTML +
      `<li>
    <div class="songs">
    <div class="song-image">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
            <circle cx="6.5" cy="18.5" r="3.5" stroke="currentColor" stroke-width="1.5" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5" />
            <path d="M10 18.5L10 7C10 6.07655 10 5.61483 10.2635 5.32794C10.5269 5.04106 11.0175 4.9992 11.9986 4.91549C16.022 4.57222 18.909 3.26005 20.3553 2.40978C20.6508 2.236 20.7986 2.14912 20.8993 2.20672C21 2.26432 21 2.4315 21 2.76587V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 10C15.8667 10 19.7778 7.66667 21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </div>
    <div class="song-details">
    ${song.replaceAll("%20", " ")}
    </div>
    <div class="toplay flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
            <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="currentColor" />
        </svg>
    </div>
</div>
    </li>`;

    Array.from(
      document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        // console.log(e.querySelector(".song-details").innerHTML.trim())
        playsong(e.querySelector(".song-details").innerHTML.trim());
      });
    });
  }
}
const playsong = (track, pause = false) => {
  currentsongs.src = `/spotify/${Currfolder}/` + track;
  if (!pause) {
    currentsongs.play();
    playStop.src = "pause.svg";
  }

  document.querySelector(".playbar-name").innerHTML = decodeURI(track);
  document.querySelector(".duration").innerHTML = "0:00/0:00";
};
function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // Add leading zero to seconds if less than 10
  remainingSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${minutes}:${remainingSeconds}`;
}
let cardContainer = document.querySelector(".playlist");

async function popplaylists() {
  let a = await fetch(`http://127.0.0.1:5501/spotify/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a");

  let array = Array.from(anchor);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/songs/").slice(-1)[0];
      let a = await fetch(
        `http://127.0.0.1:5501/spotify/songs/${folder}/info.json`
      );
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `
        <div data-folder="${folder}" class="playlists border-radius">
    <div class="img">
        <img class="image" src="/spotify/songs/${folder}/photo.jpeg">
        <div class="play-button">
            <div class="circle" >
                <div class="play"></div>
            </div>
            
        </div>
    </div>
        
    <div class="title">
        <h3 class="playlist-name">${response.title}</h3>
        <p class="discription">${response.description}</p>
    </div>
</div>`;
    }
  }
  Array.from(document.getElementsByClassName("playlists")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  await getsongs("songs/first");
  playsong(songs[0], true);

  popplaylists();

  playStop.addEventListener("click", () => {
    if (currentsongs.paused) {
      currentsongs.play();
      playStop.src = "pause.svg";
    } else {
      currentsongs.pause();
      playStop.src = "play.svg";
    }
  });

  let duration = document.querySelector(".duration");
  currentsongs.addEventListener("timeupdate", () => {
    duration.innerHTML = `${convertSecondsToMinutes(
      currentsongs.currentTime
    )}/${convertSecondsToMinutes(currentsongs.duration)}`;
    document.querySelector(".circle-scroll").style.left =
      (currentsongs.currentTime / currentsongs.duration) * 100 + "%";
  });
  document.querySelector(".scroll").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle-scroll").style.left = percent + "%";
    currentsongs.currentTime = (percent / 100) * currentsongs.duration;
  });

  prev.addEventListener("click", () => {
    let index = songs.indexOf(currentsongs.src.split("/").slice(-1)[0]);
    if (index > 0) {
      playsong(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsongs.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playsong(songs[index + 1]);
    }
  });

  let volume = document
    .querySelector(".range")
    .getElementsByTagName("input")[0];
  volume.addEventListener("change", (e) => {
    currentsongs.volume = e.target.value / 100;
  });
}
main();
