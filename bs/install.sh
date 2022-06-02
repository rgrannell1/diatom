#! /usr/bin/env zsh

source "bs/bundle.sh"

sudo cp dist/diatom /usr/bin/diatom
sudo cp minima /usr/bin/minima

echo '🔶 diatom installed.'

ls /usr/bin/diatom*
