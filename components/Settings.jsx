/**
 *
 *  greentext in discord
 *  Copyright (C) 2021 yui
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
const { SwitchItem, TextInput } = require('powercord/components/settings');

module.exports = class GreenTextSettings extends React.Component {
    static DEFAULT_COLOR = "#789922";

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <SwitchItem
                    note="Whether to convert blockquotes into greentext. (NYI)"
                    value={this.props.getSetting("convertQuotes")}
                    onChange={() => this.props.toggleSetting("convertQuotes")}
                    disabled
                >
                    Convert blockquotes
                </SwitchItem>

                <TextInput
                    note="The color used for greentext."
                    defaultValue={this.props.getSetting("color")}
                    onChange={value => {
                        if (!value.trim()) {
                            value = GreenTextSettings.DEFAULT_COLOR;
                        }

                        this.props.updateSetting("color", value);
                    }}
                >
                    Greentext color
                </TextInput>
            </div>
        );
    }
};

