let songs = [];
let currfolder;
let currentsong = new Audio();

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let response = await fetch(`/${folder}/`);
  let text = await response.text();

  let div = document.createElement("div");
  div.innerHTML = text;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Akash</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play2.svg" alt="">
                </div>
            </li>`;
  }
  //attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

function playmusic(track, pause = false) {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    document.getElementById("play").src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  let response = await fetch(`/songs/`);
  let text = await response.text();

  let div = document.createElement("div");
  div.innerHTML = text;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");

  for (let e of anchors) {
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      //get metadata of the folder
      let res = await fetch(`/songs/${folder}/info.json`);
      let info = await res.json();

      cardcontainer.innerHTML += `
                <div data-folder="${folder}" id="card" class="card">
                    <div class="playbutton">
                        <img src="img/play.svg" alt="Playbutton">
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h3>${info.title}</h3>
                    <p>${info.description}</p>
                </div>`;
    }
  }
  //load the playlist when a card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0]);
    });
  });
}

function main() {
  getsongs("songs/cs");
  playmusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  let play = document.getElementById("play");
  let previous = document.getElementById("privious");
  let next = document.getElementById("next");

  //attach an event listener to privious ,play ,next
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play2.svg";
    }
  });
  //Listen for time update event
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });
  //Add event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamberger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-130%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index > 0) {
      playmusic(songs[index - 1]);
    } else {
      playmusic(songs[songs.length - 1]); // Loop back to last song
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").pop());
    if (index < songs.length - 1) {
      playmusic(songs[index + 1]);
    } else {
      playmusic(songs[0]); // Loop back to first song
    }
  });
  //add event to volumn
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
    if (currentsong.volume > 0) {
      document.querySelector(".volumn img").src = document
        .querySelector(".volumn img")
        .src.replace("mute.svg", "volumn.svg");
    }
  });
  //add event listener to mute the track
  document.querySelector(".volumn img").addEventListener("click", (e) => {
    if (e.target.src.includes("volumn.svg")) {
      e.target.src = e.target.src.replace("volumn.svg", "mute.svg");
      currentsong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volumn.svg");
      currentsong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
