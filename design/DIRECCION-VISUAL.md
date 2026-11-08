# Wedding Invitation Visual Exploration

Date: October 26, 2026.

## Updated Scope

At the user's direction, the final catalog will have **10 designs, rather than 88**. Website implementation is paused at the preparation stage until this exploration is reviewed. Previously obtained catalog files and assets are reference material; they do not represent the approved catalog. Only five mockups and documentation were created at this stage, without advancing the application code.

Each board shows a mobile cover and an interior section of the same invitation. They are static conceptual images generated with the built-in image_gen tool, rather than functional screens or application screenshots. Event names, photographs, venues, schedules, and copy are illustrative. The five complete prompts are in `prompts.json`.

## Research and Rationale

The first five designs at https://fixdate.io/co/bodas were reviewed: Magnolias Gold, Vintage, Hojas, Roses, and Aurum Wine. Their emotional themes—floral elegance, warm photography, nature, romance, and gala—are retained while changing composition, illustrations, hierarchy, photography, and typographic treatment.

Sources consulted:

- Canva, [Design Trends 2026](https://www.canva.com/newsroom/news/design-trends-2026/): textures, visual authenticity, cinematic storytelling, and calmer editorial compositions.
- Adobe, [Design Trends for 2026](https://www.adobe.com/express/learn/blog/design-trends-2026): sensory experiences, expressive typography, organic design, storytelling, and local cultural references.
- Paperlust, [2026 Wedding Invitation Trends](https://paperlust.co/blog/2026-wedding-invitation-trends/): translucent layers, textured paper, handcrafted finishes, and illustrations with editorial typography.
- THE WED, [10 Major Wedding Stationery & Signage Trends for 2026](https://thewed.com/magazine/major-wedding-stationery-signage-trends-for-2026): transparency, prominent typography, materials, and interactive opening.

These publications are editorial and commercial trend signals, rather than evidence that a style will sell better in Colombia. The digital adaptation and interactions proposed below are original design decisions. Elegance, readability, and personality take priority over accumulating effects.

## Five Proposals

| Reference | Original Concept | Palette | Main Difference |
| --- | --- | --- | --- |
| Magnolias Gold | Magnolia editorial (Editorial Magnolia) | Ivory #F6F1E7, charcoal #292D29, antique gold #A58B57 | Large asymmetric magnolia, editorial names, and a schedule with architectural drawing. |
| Vintage | Memorias de película (Film Memories) | Brown #34251E, cream #F6EAD7, terracotta #B56848 | Documentary photography and the couple's story told through photographic memories. |
| Hojas | Jardín botánico (Botanical Garden) | Forest #173F35, pistachio #DCE4CC, warm white #F4F2E8 | Contemporary herbarium, local vegetation, and an illustrated map as the invitation's identity. |
| Roses | Rosa contemporánea (Contemporary Rose) | Pink #F2DADD, cherry #7E243B, coral #D7897D | One focal flower, monumental names, and color blocks. |
| Aurum Wine | Vino de gala (Gala Wine) | Wine #481D2C, champagne #EAD9B7, brass #B79965 | Architectural geometry, evening photography, and a gala schedule. |

Colors are target values for future implementation; generated images may vary. Collection names are provisional.

## Proposed Innovations, Not Yet Implemented

1. **Personal welcome:** show the guest's name and allowance integrated into the design, following the previously requested demo scope.
2. **Scroll storytelling:** each section has a clear role—couple, venue, schedule, confirmation—and transitions smoothly. Do not block scrolling or hide actions during animations.
3. **Event-specific artwork:** venue illustration, couple's monogram, or local vegetation. The decorative map will be complemented by verified addresses and a real navigation link.
4. **Subtle motion:** line drawing in Magnolia, photographic transitions in Memorias, a route reveal in Jardín, a gentle illustration entrance in Rosa, and a brief shimmer in Vino. No autoplay music; respect reduced motion.
5. **Clear RSVP:** a form in short stages with configurable questions from the original scope, accompanied by visible access to the schedule and map.

The public website may retain turquoise and yellow. Each invitation must have its own palette; repeating the public website's colors across all designs would reduce variety.

## Mockup Review and Adjustments Before Coding

- The five directions have distinct compositions and two consistent views per design.
- For an actual 390 px screen, several secondary text sizes must increase, contrast must be checked, content must be allowed to grow, and controls must be at least 44 px.
- Some board headings are very large; responsive sizing will preserve their editorial character.
- In Jardín, the date appears twice: retain one instance and use the other space for the personalized welcome.
- In Rosa, the generated flower resembles a peony; when producing the final asset, deliberately choose between a botanically accurate rose and renaming the floral collection.
- The Memorias board shows the button in the continuation; implementation will also add early access to RSVP from the cover.
- Illustrated maps, venues, and schedules are not verified geographic or event information.
- Photographs are synthetic for this exploration. The personalized version will use photographs supplied by the couple.
- Full boards are not proposed as website backgrounds. Text and controls will be accessible HTML, and artwork will be produced as separate assets.

## Recommendation

Jardín botánico offers the strongest opportunity for a local identity. Magnolia editorial provides a restrained, broadly appealing alternative. Memorias de película adds a photography-focused option. The next five proposals should expand the visual themes rather than repeat these in different colors.

Before resuming implementation, gather the user's preferences on these five directions and develop the selected direction or directions with the adjustments above.
