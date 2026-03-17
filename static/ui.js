const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
	flags: {
		rewriterLogs: false,
		scramitize: false,
		cleanErrors: true,
		sourcemaps: true,
	},
});

scramjet.init();
navigator.serviceWorker.register("./sw.js");

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const flex = css`
	display: flex;
`;
const col = css`
	flex-direction: column;
`;

connection.setTransport(store.transport, [{ wisp: store.wispurl }]);

function Config() {
	this.css = `
    transition: opacity 0.4s ease;
    :modal[open] {
        animation: fade 0.4s ease normal;
    }
    :modal::backdrop {
      backdrop-filter: blur(3px);
    }
    .buttons button {
      border: 2px solid;
      border-color: #ffffff #808080 #808080 #ffffff;
      background-color: #c0c0c0;
      color: #000;
      padding: 0.45em;
    }
    .buttons button:active {
      border-color: #808080 #ffffff #ffffff #808080;
    }
    .input_row input {
      background-color: #fff;
      border: 2px solid;
      border-color: #808080 #ffffff #ffffff #808080;
      color: #000;
      outline: none;
      padding: 0.45em;
    }
  `;

	function handleModalClose(modal) {
		modal.style.opacity = 0;
		setTimeout(() => {
			modal.close();
			modal.style.opacity = 1;
		}, 250);
	}

	return html`
      <dialog class="cfg" style="background-color: #c0c0c0; color: black; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; padding: 2px; width: 350px;">
        <div style="background: linear-gradient(90deg, #000080, #1084d0); color: white; padding: 3px 10px; font-weight: bold; font-size: 13px; display: flex; justify-content: space-between;">
            <span>Settings</span>
        </div>
        <div style="padding: 1em;">
            <div class=${[flex, "buttons"]} style="margin-bottom: 1em; gap: 5px;">
                <button on:click=${() => {
							connection.setTransport("/baremod/index.mjs", [store.bareurl]);
							store.transport = "/baremod/index.mjs";
						}}>Bare 3</button>
                <button on:click=${() => {
							connection.setTransport("/libcurl/index.mjs", [
								{ wisp: store.wispurl },
							]);
							store.transport = "/libcurl/index.mjs";
						}}>Libcurl</button>
                  <button on:click=${() => {
								connection.setTransport("/epoxy/index.mjs", [
									{ wisp: store.wispurl },
								]);
								store.transport = "/epoxy/index.mjs";
							}}>Epoxy</button>
            </div>
            <div class=${[flex, col, "input_row"]}>
              <label style="font-size: 11px;">Wisp URL:</label>
              <input bind:value=${use(store.wispurl)} spellcheck="false"></input>
            </div>
            <div class=${[flex, col, "input_row"]} style="margin-top: 5px;">
              <label style="font-size: 11px;">Bare URL:</label>
              <input bind:value=${use(store.bareurl)} spellcheck="false"></input>
            </div>
            <div style="font-size: 10px; margin: 10px 0;">Active: ${use(store.transport)}</div>
            <div class=${[flex, "buttons"]} style="justify-content: center;">
              <button on:click=${() => handleModalClose(this.root)}>OK</button>
            </div>
        </div>
      </dialog>
  `;
}

function BrowserApp() {
	this.css = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    
    iframe {
      background-color: #fff;
      border: 2px solid;
      border-color: #808080 #ffffff #ffffff #808080;
      flex: 1;
      width: 100%;
    }

    .nav {
      padding: 5px;
      gap: 5px;
      background-color: #c0c0c0;
    }

    .nav button {
      border: 2px solid;
      border-color: #ffffff #808080 #808080 #ffffff;
      background-color: #c0c0c0;
      padding: 2px 8px;
      color: black;
      font-family: "MS Sans Serif", "Tahoma", sans-serif;
      cursor: pointer;
    }

    .nav button:active {
      border-color: #808080 #ffffff #ffffff #808080;
    }

    input.bar {
      border: 2px solid;
      border-color: #808080 #ffffff #ffffff #808080;
      padding: 2px 6px;
      flex: 1;
      outline: none;
      color: black;
    }
  `;
  
	this.url = store.url;
	const frame = scramjet.createFrame();

	this.mount = () => {
		let body = btoa(
			`<body style="background-color: #008080; background-image: url('https://i.pinimg.com/736x/a7/a2/0e/a7a20e9a4c0c5ed6af6cbaf3c268d701.jpg'); background-size: cover; background-position: center; margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'MS Sans Serif', Tahoma, sans-serif;">
          <div style="background-color: #c0c0c0; border: 2px solid; border-color: #dfdfdf #000000 #000000 #dfdfdf; padding: 2px; text-align: center; box-shadow: 2px 2px 10px rgba(0,0,0,0.5);">
              <div style="background: #000080; color: white; padding: 3px 5px; font-weight: bold; font-size: 12px; text-align: left;">
                  Welcome
              </div>
              <div style="padding: 30px 50px;">
                  <h1 style="font-size: 5em; margin: 0; color: #000; text-shadow: 2px 2px 0px #fff;">95 OS</h1>
                  <div style="height: 2px; background: #808080; border-bottom: 1px solid #ffffff; margin: 15px 0;"></div>
                  <p style="font-size: 14px; color: #000; margin-top: 10px;">Type a URL or search above to begin.</p>
              </div>
          </div>
       </body>`
		);
		frame.go(`data:text/html;base64,${body}`);
	};

	frame.addEventListener("urlchange", (e) => {
		if (!e.url) return;
		this.url = e.url;
	});

	const handleSubmit = () => {
		let input = this.url.trim();
		const searchEngine = "https://duckduckgo.com/?q=";

		if (input.startsWith("http://") || input.startsWith("https://")) {
			this.url = input;
		} else if (input.includes(".") && !input.includes(" ")) {
			this.url = "https://" + input;
		} else {
			this.url = searchEngine + encodeURIComponent(input);
		}

		store.url = this.url;
		return frame.go(this.url);
	};

	const cfg = h(Config);
	document.body.appendChild(cfg);

	return html`
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
        <div class=${[flex, "nav"]}>
          <button on:click=${() => cfg.showModal()}>config</button>
          <button on:click=${() => frame.back()}>&lt;-</button>
          <button on:click=${() => frame.forward()}>-&gt;</button>
          <button on:click=${() => frame.reload()}>&#x21bb;</button>

          <input class="bar" autocomplete="off" autocapitalize="off" autocorrect="off" 
          bind:value=${use(this.url)} on:input=${(e) => {
                      this.url = e.target.value;
                  }} on:keyup=${(e) => e.keyCode == 13 && handleSubmit()}></input>

          <button on:click=${() => window.open(scramjet.encodeUrl(this.url))}>open</button>
        </div>
        ${frame.frame}
      </div>
    `;
}

window.addEventListener("load", async () => {
	const root = document.getElementById("app");
	try {
		root.replaceWith(h(BrowserApp));
	} catch (e) {
		root.replaceWith(document.createTextNode("" + e));
		throw e;
	}
});
