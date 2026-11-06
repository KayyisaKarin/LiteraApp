import PptxGenJS from 'pptxgenjs';
import { SlideData, PresenterInfo } from '../types/presentation';

/**
 * Generates and downloads a real, genuine Microsoft PowerPoint (.pptx) file
 * using pptxgenjs, matching the 16:9 widescreen layout and visual identity of litera.
 */
export async function exportPresentationToPPTX(
  slides: SlideData[],
  presenterInfo: PresenterInfo
): Promise<void> {
  const pptx = new PptxGenJS();

  // Configure presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = presenterInfo.name;
  pptx.company = presenterInfo.school;
  pptx.title = 'litera — Open Library Books App Presentation';
  pptx.subject = 'Digital Library Explorer Project Presentation';

  // Theme Colors
  const COLOR_BG_LAVENDER = 'CBD0F8';
  const COLOR_WHITE = 'FFFFFF';
  const COLOR_NAVY = '1E2138';
  const COLOR_SECONDARY_NAVY = '3A3F64';
  const COLOR_MUTED = '6B7494';
  const COLOR_ACCENT_GOLD = 'D8A243';
  const COLOR_CARD_BG = 'F8F9FE';
  const COLOR_CARD_BORDER = 'E0E4F8';

  const totalCount = slides.length;

  slides.forEach((slide) => {
    const s = pptx.addSlide();

    // Attach speaker notes to the PowerPoint slide for presenter rehearsal
    if (slide.speakerNotes) {
      s.addNotes(`[CATATAN PEMBICARA / PRESENTASI]:\n${slide.speakerNotes}`);
    }

    // ==========================================
    // Slide 1: Cover Slide
    // ==========================================
    if (slide.id === 1) {
      s.background = { color: COLOR_BG_LAVENDER };

      // Main White Card Container
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 0.6,
        w: 11.7,
        h: 6.3,
        fill: { color: COLOR_WHITE },
        line: { color: COLOR_CARD_BORDER, width: 1.5 },
        rectRadius: 0.25,
      });

      // Top Tag Badge
      s.addShape(pptx.ShapeType.roundRect, {
        x: 1.3,
        y: 1.1,
        w: 3.2,
        h: 0.45,
        fill: { color: COLOR_BG_LAVENDER },
        rectRadius: 0.15,
      });
      s.addText(slide.tag, {
        x: 1.3,
        y: 1.1,
        w: 3.2,
        h: 0.45,
        fontSize: 10,
        bold: true,
        color: COLOR_NAVY,
        align: 'center',
        valign: 'middle',
      });

      // Big Title
      s.addText(slide.title, {
        x: 1.3,
        y: 1.7,
        w: 10.5,
        h: 1.1,
        fontSize: 42,
        bold: true,
        color: COLOR_NAVY,
        fontFace: 'Plus Jakarta Sans',
      });

      // Subtitle
      s.addText(slide.subtitle, {
        x: 1.3,
        y: 2.9,
        w: 10.5,
        h: 0.6,
        fontSize: 18,
        color: COLOR_MUTED,
        fontFace: 'Plus Jakarta Sans',
      });

      // Divider line
      s.addShape(pptx.ShapeType.line, {
        x: 1.3,
        y: 3.7,
        w: 10.5,
        h: 0,
        line: { color: COLOR_CARD_BORDER, width: 1 },
      });

      // Presenter Info Section
      s.addText('PRESENTED BY:', {
        x: 1.3,
        y: 4.1,
        w: 4.5,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: COLOR_MUTED,
      });

      s.addText(
        `${presenterInfo.name}\n${presenterInfo.classGrade}\n${presenterInfo.school}`,
        {
          x: 1.3,
          y: 4.45,
          w: 5.5,
          h: 1.5,
          fontSize: 13,
          bold: true,
          color: COLOR_NAVY,
          lineSpacing: 22,
        }
      );

      // Metadata right block (Academic Year & Method)
      s.addShape(pptx.ShapeType.roundRect, {
        x: 7.2,
        y: 4.0,
        w: 4.6,
        h: 2.3,
        fill: { color: COLOR_CARD_BG },
        line: { color: COLOR_CARD_BORDER, width: 1 },
        rectRadius: 0.15,
      });

      s.addText(
        `• Jenis: Digital Library Explorer\n• API: Open Library (Search & Covers)\n• HTTP Method: GET\n• Format Data: JSON\n• Tahun Ajaran: ${presenterInfo.academicYear}`,
        {
          x: 7.5,
          y: 4.2,
          w: 4.0,
          h: 1.9,
          fontSize: 11,
          color: COLOR_SECONDARY_NAVY,
          lineSpacing: 20,
        }
      );

      return;
    }

    // ==========================================
    // Default Slide Layout (Slides 2 to 6)
    // ==========================================
    s.background = { color: COLOR_BG_LAVENDER };

    // Slide Header: Top tag & Slide Number
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.4,
      w: 3.2,
      h: 0.35,
      fill: { color: COLOR_WHITE },
      rectRadius: 0.1,
    });
    s.addText(slide.tag, {
      x: 0.8,
      y: 0.4,
      w: 3.2,
      h: 0.35,
      fontSize: 9,
      bold: true,
      color: COLOR_NAVY,
      align: 'center',
      valign: 'middle',
    });

    // Slide Counter
    s.addText(`SLIDE ${slide.slideNumber} / ${totalCount}`, {
      x: 9.8,
      y: 0.4,
      w: 2.7,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: COLOR_SECONDARY_NAVY,
      align: 'right',
    });

    // Title
    s.addText(slide.title, {
      x: 0.8,
      y: 0.85,
      w: 11.5,
      h: 0.65,
      fontSize: 24,
      bold: true,
      color: COLOR_NAVY,
      fontFace: 'Plus Jakarta Sans',
    });

    // Subtitle
    s.addText(slide.subtitle, {
      x: 0.8,
      y: 1.5,
      w: 11.5,
      h: 0.4,
      fontSize: 12.5,
      color: COLOR_MUTED,
      fontFace: 'Plus Jakarta Sans',
    });

    // White Main Content Card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.05,
      w: 11.7,
      h: 4.85,
      fill: { color: COLOR_WHITE },
      line: { color: COLOR_CARD_BORDER, width: 1 },
      rectRadius: 0.2,
    });

    // Content: Bullet Points layout
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      const items = slide.bulletPoints;
      const count = items.length;

      if (count <= 3) {
        // Vertical 3-row layout (e.g. Problem & Solution)
        items.forEach((item, idx) => {
          const itemY = 2.3 + idx * 1.5;

          s.addShape(pptx.ShapeType.roundRect, {
            x: 1.1,
            y: itemY,
            w: 11.1,
            h: 1.25,
            fill: { color: COLOR_CARD_BG },
            line: { color: COLOR_CARD_BORDER, width: 0.8 },
            rectRadius: 0.12,
          });

          // Badge
          if (item.badge) {
            s.addShape(pptx.ShapeType.roundRect, {
              x: 1.3,
              y: itemY + 0.18,
              w: 2.0,
              h: 0.3,
              fill: { color: COLOR_BG_LAVENDER },
              rectRadius: 0.08,
            });
            s.addText(item.badge, {
              x: 1.3,
              y: itemY + 0.18,
              w: 2.0,
              h: 0.3,
              fontSize: 8.5,
              bold: true,
              color: COLOR_NAVY,
              align: 'center',
              valign: 'middle',
            });
          }

          s.addText(item.title, {
            x: item.badge ? 3.5 : 1.4,
            y: itemY + 0.15,
            w: 8.3,
            h: 0.35,
            fontSize: 13,
            bold: true,
            color: COLOR_NAVY,
          });

          s.addText(item.description, {
            x: 1.4,
            y: itemY + 0.55,
            w: 10.5,
            h: 0.55,
            fontSize: 10.5,
            color: COLOR_MUTED,
            lineSpacing: 16,
          });
        });
      } else if (count === 4) {
        // 2x2 Grid Layout (e.g. Slide 4 & Slide 6)
        items.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const itemX = 1.1 + col * 5.65;
          const itemY = 2.3 + row * 2.25;

          s.addShape(pptx.ShapeType.roundRect, {
            x: itemX,
            y: itemY,
            w: 5.4,
            h: 2.05,
            fill: { color: COLOR_CARD_BG },
            line: { color: COLOR_CARD_BORDER, width: 0.8 },
            rectRadius: 0.12,
          });

          if (item.badge) {
            s.addShape(pptx.ShapeType.roundRect, {
              x: itemX + 0.25,
              y: itemY + 0.2,
              w: 2.2,
              h: 0.3,
              fill: { color: COLOR_BG_LAVENDER },
              rectRadius: 0.08,
            });
            s.addText(item.badge, {
              x: itemX + 0.25,
              y: itemY + 0.2,
              w: 2.2,
              h: 0.3,
              fontSize: 8,
              bold: true,
              color: COLOR_NAVY,
              align: 'center',
              valign: 'middle',
            });
          }

          s.addText(item.title, {
            x: itemX + 0.25,
            y: itemY + 0.6,
            w: 4.9,
            h: 0.4,
            fontSize: 12,
            bold: true,
            color: COLOR_NAVY,
          });

          s.addText(item.description, {
            x: itemX + 0.25,
            y: itemY + 1.05,
            w: 4.9,
            h: 0.85,
            fontSize: 10,
            color: COLOR_MUTED,
            lineSpacing: 15,
          });
        });
      } else {
        // 6 items: 2 columns x 3 rows grid (e.g. Slide 5 Feature breakdown)
        items.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const itemX = 1.1 + col * 5.65;
          const itemY = 2.25 + row * 1.48;

          s.addShape(pptx.ShapeType.roundRect, {
            x: itemX,
            y: itemY,
            w: 5.4,
            h: 1.35,
            fill: { color: COLOR_CARD_BG },
            line: { color: COLOR_CARD_BORDER, width: 0.8 },
            rectRadius: 0.1,
          });

          if (item.badge) {
            s.addShape(pptx.ShapeType.roundRect, {
              x: itemX + 0.2,
              y: itemY + 0.15,
              w: 2.0,
              h: 0.26,
              fill: { color: COLOR_BG_LAVENDER },
              rectRadius: 0.06,
            });
            s.addText(item.badge, {
              x: itemX + 0.2,
              y: itemY + 0.15,
              w: 2.0,
              h: 0.26,
              fontSize: 7.5,
              bold: true,
              color: COLOR_NAVY,
              align: 'center',
              valign: 'middle',
            });
          }

          s.addText(item.title, {
            x: itemX + 0.2,
            y: itemY + 0.48,
            w: 5.0,
            h: 0.3,
            fontSize: 11,
            bold: true,
            color: COLOR_NAVY,
          });

          s.addText(item.description, {
            x: itemX + 0.2,
            y: itemY + 0.8,
            w: 5.0,
            h: 0.48,
            fontSize: 9,
            color: COLOR_MUTED,
            lineSpacing: 13,
          });
        });
      }
    }
  });

  // Export file
  await pptx.writeFile({ fileName: `litera_Digital_Library_Explorer_Presentation.pptx` });
}
