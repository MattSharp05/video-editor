# Round 3 visual language (declared before building)

Every item of one kind passes through the same states, each state has exactly one look, and the look
never changes meaning during the film. A new look is shown clearly once before it is relied on.

## States
| State | Look | Applies to |
|---|---|---|
| idle | white at 40% | every caption word before it is read |
| being read | a soft white light passes; the word rises to white 100% | every caption word, in order |
| found | orange, weight 800, lifts 8 px, soft orange glow | every place name, the moment the light reaches it |
| travelling | stays orange with its glow; shrinks to 90% | every found name on its way to the map |
| placed | an orange glass pin rises under it; the name settles into the pin's label and cools from orange to white as it lands | every place |
| key word in a caption | orange, weight 900, lifts, soft glow | one per caption line (the same look as found) |
| active day | orange fill | the selected date pill, and Sun 15 when the row lands in it |
| pressed | scale 0.92, then back; fill turns orange | the Smart Add button |

Orange = "this is the thing to follow / this was found or chosen". Nothing else is orange.
Background echoes of orange (the flight arc, Las Vegas) are dim and never brighter than the lead.

## Not in this film
- Kaiseki Yuzu (the place the map can't find): dropped. A "not found" state would need its own look,
  introduced first; a 20 s reel doesn't need the second idea.

## Background: the world of the app (travel)
The same journey as the foreground, at the scale of the globe, quiet:
- 0–5 s: night-side Earth, slowly turning; a faint orange arc begins at Tampa (the sample trip flies
  TPA → LAS).
- 5–10 s: the camera closes on Las Vegas; the arc lands; the city lights come up.
- 10–17 s: held close over the city, defocused behind the glass (what the glass shows through).
- 17–21 s: pull back to the whole globe with the completed arc for the end card.
Rules: darker and softer than the foreground (blur and brightness down while the UI is up), moves at
about a fifth of the foreground's speed, never cuts.

## Glass
Clear edge everywhere (Matthew's pick), with a dark tint on panes that carry UI so text stays legible
over the background. No intersections: every pane keeps a gap to its neighbours larger than its own
thickness plus (half its width x sin of its tilt); moving pieces pass in front of panes, never through.
