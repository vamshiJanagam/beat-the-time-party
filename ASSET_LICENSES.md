# Asset licenses

## Current project status

No externally sourced character models are currently integrated. A local loader/model experiment was moved out of the game's public assets on 2026-10-03. No downloaded character files are part of the game.

## Original BEAT THE TIME character draft

- Creator: Generated locally for the BEAT THE TIME project with Blender 5.2.2.
- Source: `scripts/create_beat_time_characters.py`.
- Models: Twelve original seated character drafts in `character-workbench/original/`.
- Separate prototype: `character-workbench/leo-prototype/leo-seated.blend` and `leo-seated.glb`, with a rendered preview in the same folder.
- Third-party asset license: None; the models were generated from the project's own script and contain no downloaded art or models.
- Status: Standalone draft only. Not loaded by the game; the visual result still needs more sculpting to approach the supplied reference.

## Previously reviewed sources (not integrated)

### Kenney — Mini Characters

- Creator: Kenney
- Official source: https://kenney.nl/assets/mini-characters
- Previously verified license: CC0 1.0, including commercial use and modifications; attribution optional.
- Status: Not integrated. The trial files and copied loader modules were moved out of the public runtime and retained in `character-workbench/loader-experiment/` for audit.

### Quaternius — Universal Base Characters

- Creator: Quaternius
- Official source: https://quaternius.com/packs/universalbasecharacters.html
- Previously reviewed license: CC0; commercial use allowed.
- Status: Not integrated.

This file records license review; the MakeHuman/MPFB Arjun trial below is specifically authorized by the user. Other external assets are not covered by that authorization.

## MakeHuman / MPFB — approved isolated Arjun trial

- Tool: MPFB2 (MakeHuman Plugin for Blender), maintained by the MakeHuman Community. Official setup/source: https://static.makehumancommunity.org/mpfb/docs/getting_started.html
- Tool license: MPFB source code is GPL-licensed. This is the tool's software license; it is separate from the character graphics used in the game.
- Asset set: MakeHuman core/system assets only (base mesh, morph targets, and core system assets needed to create and dress the character). Official license overview: https://static.makehumancommunity.org/about/license.html
- Asset license: CC0 for MakeHuman's core graphical assets and derivatives; commercial use and modification are permitted without attribution. Official exported-model FAQ: https://static.makehumancommunity.org/makehuman/faq/can_i_sell_models_created_with_makehuman.html
- Cross-check for the system asset pack: https://static.makehumancommunity.org/assets/assetpacks.html (the MakeHuman system assets are listed as CC0).
- Exclusions: no community-contributed asset repository items or packs, no CC-BY content, and no third-party models or textures.
- Status: User authorized an isolated Arjun trial on 2026-10-03. No MakeHuman assets have been downloaded or integrated yet; this entry records the verified terms for the approved trial.
