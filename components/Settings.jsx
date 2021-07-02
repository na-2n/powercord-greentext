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

const { React } = require("powercord/webpack");
const { SwitchItem } = require('powercord/components/settings');

module.exports = class GreenTextSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <SwitchItem
                    note="Whether to convert blockquotes into greentext."
                    value={this.props.getSetting("quotes")}
                    onChange={() => this.props.toggleSetting("quotes")}
                >
                    Convert blockquotes
                </SwitchItem>

                <SwitchItem
                    note="Whether to convert lines starting with '>' into greentext."
                    value={this.props.getSetting("messages")}
                    onChange={() => this.props.toggleSetting("messages")}
                >
                    Convert messages
                </SwitchItem>
            </div>
        );
    }
};

