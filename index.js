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
        const SimpleMarkdown = await getModule(m => m.parseEmbedTitle);

        inject("greentext", SimpleMarkdown, "parse", (args) => {
            return SimpleMarkdown.reactParserFor({
                greentext: {
                    order: SimpleMarkdown.defaultRules.text.order,
                    match: (text, state) => {
                        if (state.inGreetext || state.inQuote) return null;

                        return /^$|\n$/.test(
                            state.prevCapture != null ? state.prevCapture[0] : ""
                        ) && /^(>.+?)(?:\n|$)/.exec(text);
                    },
                    parse: (capture, parse, state) => {
                        state.inGreetext = true;

                        const node = {
                            content: parse(capture[0], state),
                            type: "greentext"
                        };

                        delete state.inGreetext;
                        return node;
                    },
                    react: (node, recurseOutput, state) => (
                        React.createElement(
                            "span",
                            // this is actually retarded
                            // TODO: find a better way to turn it on/off, maybe loading/unloading css?
                            { className: (self.settings.get("messages", true) ? "greentext" : "greentext-off") },
                            recurseOutput(node.content, state)
                        )
                    )
                },
                ...SimpleMarkdown.defaultRules,
                // TODO: see previous comment
                blockQuote: {
                    ...SimpleMarkdown.defaultRules.blockQuote,
                    react: (node, recurseOutput, state) => self.settings.get("quotes", false) ? (
                        React.createElement(
                            "div",
                            { className: "blockquoteContainer greentext" },
                            React.createElement(
                                "blockquote",
                                null,
                                recurseOutput(node.content, state)
                            )
                        )
                    ) : SimpleMarkdown.defaultRules.blockQuote.react(node, recurseOutput, state)
                }
            })(...args)
        });
    }
}
