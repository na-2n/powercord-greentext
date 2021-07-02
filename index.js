/**
 *
 *  greentext on discord
 *  Copyright (C) 2021  yui
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

const { React, getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { Plugin } = require("powercord/entities");

const Settings = require("./components/Settings.jsx");

// TODO: change message preview stuff as well
module.exports = class GreenText extends Plugin {
    async startPlugin() {
        this._ensureSetting("quotes", false)
        this._ensureSetting("messages", true);
        //this._ensureSetting("color", Settings.DEFAULT_COLOR);

        this.loadStylesheet("./greentext.scss");

        powercord.api.settings.registerSettings("greentext", {
            category: this.entityID,
            label: "Greentext",
            render: Settings
        });

        await this._inject();
    }

    _ensureSetting(name, defaultValue) {
        this.settings.set(name, this.settings.get(name, defaultValue));
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings("greentext");

        uninject("greentext");
    }

    async _inject() {
        const self = this;
        const MessageContent = await getModule(m => m.type?.displayName === "MessageContent");

        inject("greentext", MessageContent, "type", (_, res) => {
            const children = res.props.children.find(x => Array.isArray(x));

            for (const i in children) {
                // separate the child from its siblings for easy access
                const child = children[i];

                // check if the child is a string or a different react component
                // TODO: fix markup inside of greentext, currently does not work
                if (self.settings.get("messages", true) && typeof child === "string") {
                    // split it by newline so we dont make the whole message green
                    const lines = child.split("\n");

                    // only replace shit if we actually have greentext in the message
                    if (lines.some(l => l.startsWith(">"))) {
                        // go over each line to see where we need to insert greentext components
                        for (const ln in lines) {
                            const line = lines[ln];

                            if (line.startsWith(">")) {
                                // replace the greentext line with a greentext component
                                lines[ln] = React.createElement("div", { className: "greentext" }, line);
                            }
                        }

                        // remove the old child
                        children.splice(i, 1);
                        // insert our new child with the greentext components at the front
                        children.unshift(lines);
                    }
                } else if (self.settings.get("quotes", false) && child.props?.className?.includes("blockquoteContainer")) {
                    children[i].props.className += " greentext";

                    // find the actual blockquote element
                    const blockquote = child.props.children.find(c => c.type === "blockquote");

                    const newChildren = blockquote.props.children
                        .map(
                            // check if string in case discord does funky stuff like nested blockquotes (they probably wont)
                            // NOTE: the downside to trimming here is that it also voids inteded blank quotes at start and end
                            x => typeof x === "string" ? x.trim().split("\n") : x
                        )
                        .flatMap(x => x)
                        // NOTE: might need to move over og blockquote props if discord ever does something special, not a big concern
                        .map(x => React.createElement("blockquote", null, x));

                    // fuck these old children, we have new and better children
                    children[i].props.children = newChildren;
                }
            }

            return res;
        });

        MessageContent.type.displayName = "MessageContent";
    }
}
