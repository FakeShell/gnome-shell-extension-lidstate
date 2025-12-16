import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const LID_STATE_PATH = '/proc/acpi/button/lid/LID/state';

const LidStateIndicator = GObject.registerClass(
    { GTypeName: 'LidStateIndicator' },
    class LidStateIndicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'Lid State', false);

            this._timeout = null;
            this._refreshRateSeconds = 2;

            this._label = new St.Label({
                name: 'lidstate-indicator-buttonText',
                y_align: Clutter.ActorAlign.CENTER,
                text: 'Lid: ?',
            });
            this.add_child(this._label);

            this.connect('button-press-event', () => Clutter.EVENT_STOP);
            this.connect('touch-event', () => Clutter.EVENT_STOP);
            this.connect('key-press-event', () => Clutter.EVENT_STOP);

            this._refresh();
            this._startLoop();
        }

        _readLidState() {
            try {
                const file = Gio.File.new_for_path(LID_STATE_PATH);
                const [, contents] = file.load_contents(null);
                return new TextDecoder('utf-8').decode(contents);
            } catch {
                return null;
            }
        }

        _refresh() {
            const text = this._readLidState();

            if (text) {
                const isClosed = /\bclosed\b/i.test(text);
                this._label.set_text(isClosed ? 'Lid: closed' : 'Lid: open');
            } else {
                this._label.set_text('Lid: ?');
            }

            return GLib.SOURCE_REMOVE;
        }

        _startLoop() {
            this._stopLoop();
            this._timeout = GLib.timeout_add_seconds(
                GLib.PRIORITY_DEFAULT,
                this._refreshRateSeconds,
                () => {
                    this._refresh();
                    return GLib.SOURCE_CONTINUE;
                }
            );
        }

        _stopLoop() {
            if (this._timeout) {
                GLib.source_remove(this._timeout);
                this._timeout = null;
            }
        }

        destroy() {
            this._stopLoop();
            super.destroy();
        }
    }
);

export default class LidStateExtension extends Extension {
    enable() {
        this._indicator = new LidStateIndicator();
        Main.panel.addToStatusArea('lidstate-indicator', this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
