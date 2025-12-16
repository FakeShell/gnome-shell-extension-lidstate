install:
	@install -Cdv "$(HOME)/.local/share/gnome-shell/extensions/lidstate@fakeshell.bardia.tech"
	@install -Cv -m 644 extension.js metadata.json stylesheet.css \
		"$(HOME)/.local/share/gnome-shell/extensions/lidstate@fakeshell.bardia.tech"

uninstall:
	@-rm -rfv "$(HOME)/.local/share/gnome-shell/extensions/lidstate@fakeshell.bardia.tech"
