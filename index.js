// part1
let github = document.getElementById("github");

Promise.all([
  fetch("https://api.github.com/users/guanteckkang"),
  fetch("https://api.github.com/users/guanteckkang/repos?sort=pushed"),
])
  .then((responses) => {
    return Promise.all(
      responses.map((response) => {
        return response.json();
      })
    );
  })
  .then((data) => {
    render(data);
  })
  .catch((error) => {
    console.log(error);
  });

function render(data) {
  let [profile, repos] = data;
  repos.sort((repo1, repo2) => {
    if (repo1.stargazers_count > repo2.stargazers_count) {
      return -1;
    }
    return 1;
  });
  repos = repos.slice(0, 5);
  github.innerHTML = cleanHTML(`<div class="gh-grid">
  <div class="gh-avatar">
    <p><img alt="" src="${profile.avatar_url}"></p>
  </div>
  <div class="gh-details">
    <p>
      <strong>${profile.name}</strong><br>
      ${profile.location}<br>
      <em><a href="${profile.url}">${profile.public_repos} public repos</a></em>
    </p>
    <ul>
      ${repos
        .map(function (repo) {
          return `<li><a href="${repo.html_url}">${repo.name}</a> - ${repo.stargazers_count} Stars</li>`;
        })
        .join("")}
    </ul>
  </div>
</div>`);
}
function cleanHTML(str, nodes) {
  /**
   * Convert the string to an HTML document
   * @return {Node} An HTML document
   */
  function stringToHTML() {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body || document.createElement("body");
  }

  /**
   * Remove <script> elements
   * @param  {Node} html The HTML
   */
  function removeScripts(html) {
    let scripts = html.querySelectorAll("script");
    for (let script of scripts) {
      script.remove();
    }
  }

  /**
   * Check if the attribute is potentially dangerous
   * @param  {String}  name  The attribute name
   * @param  {String}  value The attribute value
   * @return {Boolean}       If true, the attribute is potentially dangerous
   */
  function isPossiblyDangerous(name, value) {
    let val = value.replace(/\s+/g, "").toLowerCase();
    if (["src", "href", "xlink:href"].includes(name)) {
      if (val.includes("javascript:") || val.includes("data:")) return true;
    }
    if (name.startsWith("on")) return true;
  }

  /**
   * Remove potentially dangerous attributes from an element
   * @param  {Node} elem The element
   */
  function removeAttributes(elem) {
    // Loop through each attribute
    // If it's dangerous, remove it
    let atts = elem.attributes;
    for (let { name, value } of atts) {
      if (!isPossiblyDangerous(name, value)) continue;
      elem.removeAttribute(name);
    }
  }

  /**
   * Remove dangerous stuff from the HTML document's nodes
   * @param  {Node} html The HTML document
   */
  function clean(html) {
    let nodes = html.children;
    for (let node of nodes) {
      removeAttributes(node);
      clean(node);
    }
  }

  // Convert the string to HTML
  let html = stringToHTML();

  // Sanitize it
  removeScripts(html);
  clean(html);

  // If the user wants HTML nodes back, return them
  // Otherwise, pass a sanitized string back
  return nodes ? html.childNodes : html.innerHTML;
}
