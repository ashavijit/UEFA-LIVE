const groupDataEndpoint = "https://standings.uefa.com/v1/standings";
const matchDataEndpoint = "https://match.uefa.com/v2/matches";
const groupIds = {
  GrpA: 2006438,
  GrpB: 2006439,
  GrpC: 2006440,
  GrpD: 2006441,
  GrpE: 2006442,
  GrpF: 2006443,
};
const groupMatchIds = {
  GrpA: [2024447, 2024448, 2024457, 2024458, 2024467, 2024468],
  GrpB: [2024449, 2024450, 2024459, 2024460, 2024469, 2024470],
  GrpC: [2024441, 2024442, 2024443, 2024444, 2024445, 2024446],
  GrpD: [2024451, 2024452, 2024461, 2024462, 2024471, 2024472],
  GrpE: [2024453, 2024454, 2024463, 2024464, 2024473, 2024474],
  GrpF: [2024455, 2024456, 2024465, 2024466, 2024475, 2024476],
};

const allGroupIds = Object.keys(groupIds).map((key) => groupIds[key]);
const tableHeaders = {
  played: ["Games", "G"],
  won: ["Won", "W"],
  drawn: ["Drawn", "D"],
  lost: ["Lost", "L"],
  goalsFor: ["For", "+"],
  goalsAgainst: ["Against", "-"],
  goalDifference: ["Diff.", "+/-"],
  points: ["Points", "P"],
};
let prevGroupsDataString;
let groupTablesEl = document.querySelector("#all-groups-tables");
let firstLoad = true;

getAllGroupsStandings();

let updateInterval = setInterval(() => {
  getAllGroupsStandings();
}, 5000);

async function getAllGroupsStandings() {
  let result = await fetch(`${groupDataEndpoint}?groupIds=${allGroupIds}`);
  groupsData = await result.json();
  if (firstLoad) {
    update(groupsData);
    firstLoad = false;
  } else {
    if (prevGroupsDataString !== JSON.stringify(groupsData)) {
      update(groupsData);
    }
  }
}

async function update(groupsData) {
  prevGroupsDataString = JSON.stringify(groupsData);
  groupTablesEl.innerHTML = "";
  firstLoad = false;

  groupsData.forEach((groupData) => {
    console.log(groupData);
    createGroups(groupData);
  });
}

async function createGroups(groupData) {
  groupWrapperEl = el("div");
  groupWrapperEl.className = "group-wrapper";
  groupTablesEl.append(groupWrapperEl);

  // table
  let tableEl = document.createElement("table");
  tableEl.id = groupData.group.metaData.groupShortName;
  tableEl.className = "group-table";
  groupWrapperEl.append(tableEl);

  //table header
  let tableHeaderEl = el("thead");
  tableEl.append(tableHeaderEl);

  //table header row
  let tableHeaderRowEl = el("tr");
  tableHeaderEl.append(tableHeaderRowEl);

  //table header row cols
  let tableHeaderRowGroupnameEl = el("th", groupData.group.metaData.groupName);
  tableHeaderRowGroupnameEl.className = "col-groupname";
  tableHeaderRowEl.append(tableHeaderRowGroupnameEl);

  Object.keys(tableHeaders).forEach((tableHeader) => {
    let colNameLong = el("span", tableHeaders[tableHeader][0]);
    colNameLong.className = "col-name-long";
    let colNameShort = el("span", tableHeaders[tableHeader][1]);
    colNameShort.className = "col-name-short";
    let tableHeaderRowColEl = el("th");
    tableHeaderRowColEl.className = "col-" + tableHeader;
    tableHeaderRowColEl.append(colNameLong, colNameShort);
    tableHeaderRowEl.append(tableHeaderRowColEl);
  });

  //table body
  let tableBodyEl = el("tbody");
  tableEl.append(tableBodyEl);

  //table body rows
  groupData.items.forEach((item) => {
    let tableBodyRowEl = el("tr");
    tableBodyRowEl.classList.add("row-team", isLiveClass(item));
    tableBodyEl.append(tableBodyRowEl);

    //table body row cols
    //team name
    let tableBodyRowTeamEl = el("td");
    tableBodyRowTeamEl.className = "col-team";
    tableBodyRowEl.append(tableBodyRowTeamEl);

    let teamlogoEl = el("img");
    teamlogoEl.src = item.team.logoUrl;
    let teamNameEl = el("div", item.team.internationalName);
    teamNameEl.classList.add(isQualifiedClass(item));
    tableBodyRowTeamEl.append(teamlogoEl, teamNameEl);

    //team other fields
    Object.keys(tableHeaders).forEach((tableHeader) => {
      let tableBodyRowColEl = el(
        "td",
        item[tableHeader] == "" ? "0" : item[tableHeader]
      );
      tableBodyRowColEl.className = "col-" + tableHeader;
      tableBodyRowEl.append(tableBodyRowColEl);
    });
  });

  // groupMatches
  let groupMatchesTableEl = el("table");
  groupMatchesTableEl.className = "group-matches-table";
  groupWrapperEl.append(groupMatchesTableEl);
  console.log(groupData.status);

  let groupShortName = groupData.group.metaData.groupShortName;
  result = await fetch(
    `${matchDataEndpoint}?matchId=${groupMatchIds[groupShortName]}`
  );
  let groupMatchesData = await result.json();
  groupMatchesData.sort((a, b) => {
    return new Date(a.kickOffTime.dateTime) - new Date(b.kickOffTime.dateTime);
  });
  groupMatchesData.forEach((match) => {
    let rowEl = el("tr");
    rowEl.className = "group-match";
    groupMatchesTableEl.append(rowEl);

    //date
    let dateEl = el(
      "td",
      match.kickOffTime.date.split("-").reverse().join("/")
    );
    dateEl.className = "group-match-date";

    //home
    let homeTeamEl = el("td");
    homeTeamEl.className = "group-match-home";
    let homeTeamName = `<span>${match.homeTeam.internationalName}</span><span>${match.homeTeam.teamCode}</span>`;
    let homeTeamNameEl = el("div", homeTeamName);
    homeTeamNameEl.className = "group-match-home-name";
    let homeTeamImg = el("img");
    homeTeamImg.className = "group-match-home-img";
    homeTeamImg.src = match.homeTeam.logoUrl;
    homeTeamEl.append(homeTeamNameEl, homeTeamImg);

    //away
    let awayTeamEl = el("td");
    awayTeamEl.className = "group-match-away";
    let awayTeamName = `<span>${match.awayTeam.internationalName}</span><span>${match.awayTeam.teamCode}</span>`;
    let awayTeamNameEl = el("div", awayTeamName);
    awayTeamNameEl.className = "group-match-away-name";
    let awayTeamImg = el("img");
    awayTeamImg.className = "group-match-away-img";
    awayTeamImg.src = match.awayTeam.logoUrl;
    awayTeamEl.append(awayTeamImg, awayTeamNameEl);

    //result
    resultTimeEl = el("td");
    if (match.status == "LIVE") console.log(match);
    if (match.status == "FINISHED") {
      resultTimeEl.innerHTML =
        match.score.regular.home + "-" + match.score.regular.away;
      resultTimeEl.className = "group-match-result";
    } else if (match.status == "LIVE") {
      resultTimeEl.innerHTML =
        match.score.regular.home + "-" + match.score.regular.away;
      resultTimeEl.classList.add("group-match-result", "live");
    } else {
      let matchDate = new Date(match.kickOffTime.dateTime);
      let time =
        matchDate.getHours() +
        ":" +
        ("0" + matchDate.getMinutes()).substring(-2);
      resultTimeEl.innerHTML = time;
      resultTimeEl.className = "group-match-time";
    }

    //location
    let locationEl = el("td", match.stadium.city.translations.name["EN"]);
    locationEl.className = "group-match-location";

    rowEl.append(dateEl, homeTeamEl, resultTimeEl, awayTeamEl, locationEl);
  });
}

function el(type, content = false) {
  let divEl = document.createElement(type);
  if (content) divEl.innerHTML = content;
  return divEl;
}

function isLiveClass(item) {
  return item.isLive ? "live" : "not-live";
}

function isQualifiedClass(item) {
  return item.qualified ? "qualified" : "not-qualified";
}

function thereAreLiveGames(groupsData) {
  let liveCount = 0;
  groupsData.forEach((group) => {
    group.items.forEach((item) => {
      if (item.isLive) liveCount++;
    });
  });
  return liveCount > 0;
}
