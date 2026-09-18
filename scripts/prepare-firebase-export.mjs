import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const exportRoot = resolve("out");

function copyRoute(sourceRoute, destinationRoute) {
  const source = join(exportRoot, `${sourceRoute}.html`);
  const destination = join(exportRoot, `${destinationRoute}.html`);

  mkdirSync(resolve(destination, ".."), { recursive: true });
  copyFileSync(source, destination);
}

// Next exports the [locale] segment literally. Copy the generated locale pages
// into Firebase Hosting's public URL structure, then remove the internal copies
// so they cannot become duplicate public URLs.
copyRoute("nl-BE", "index");
copyRoute("en-BE", "en");

const localizedRoutes = [
  ["diensten", "diensten", "services"],
  ["zakelijk", "zakelijk", "business-cleaning"],
  ["werkgebied", "werkgebied", "service-area"],
  ["over-ons", "over-ons", "about"],
  ["contact", "contact", "contact"],
  ["offerte", "offerte", "quote"],
  ["privacybeleid", "privacybeleid", "privacy-policy"],
  ["cookiebeleid", "cookiebeleid", "cookie-policy"],
  ["klacht", "klacht", "complaint"],
  ["diensten/kantoorschoonmaak", "diensten/kantoorschoonmaak", "services/office-cleaning"],
  ["diensten/bedrijfsschoonmaak", "diensten/bedrijfsschoonmaak", "services/commercial-cleaning"],
  ["diensten/restaurantschoonmaak", "diensten/restaurantschoonmaak", "services/restaurant-cleaning"],
  ["diensten/hotelschoonmaak", "diensten/hotelschoonmaak", "services/hotel-cleaning"],
  ["diensten/schoolschoonmaak", "diensten/schoolschoonmaak", "services/school-cleaning"],
  ["diensten/woningschoonmaak", "diensten/woningschoonmaak", "services/home-cleaning"],
  ["diensten/grondige-schoonmaak", "diensten/grondige-schoonmaak", "services/deep-cleaning"],
  ["diensten/ramenreiniging", "diensten/ramenreiniging", "services/window-cleaning"],
  ["diensten/opleveringsschoonmaak", "diensten/opleveringsschoonmaak", "services/post-construction-cleaning"],
  ["diensten/verhuisschoonmaak", "diensten/verhuisschoonmaak", "services/move-in-move-out-cleaning"],
  ["diensten/airbnb-schoonmaak", "diensten/airbnb-schoonmaak", "services/airbnb-cleaning"],
  ["diensten/trappenhal-schoonmaak", "diensten/trappenhal-schoonmaak", "services/staircase-cleaning"],
];

for (const [internalRoute, dutchRoute, englishRoute] of localizedRoutes) {
  copyRoute(`nl-BE/${internalRoute}`, dutchRoute);
  copyRoute(`en-BE/${internalRoute}`, `en/${englishRoute}`);
}

function copyStaticArtifacts(sourceLocale, routeIndex) {
  const sourceDirectory = join(exportRoot, sourceLocale);
  const routeEntries = [...routeIndex.entries()].sort(([a], [b]) => b.length - a.length);

  function visit(directory, relativeDirectory = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const source = join(directory, entry.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        visit(source, relativePath);
        continue;
      }

      if (entry.name.endsWith(".html")) continue;

      const match = routeEntries.find(([internalRoute]) =>
        relativePath === internalRoute ||
        relativePath.startsWith(`${internalRoute}/`) ||
        relativePath.startsWith(`${internalRoute}.`),
      );
      const destination = match
        ? `${match[1]}${relativePath.slice(match[0].length)}`
        : relativePath;
      const target = join(exportRoot, destination);

      mkdirSync(resolve(target, ".."), { recursive: true });
      copyFileSync(source, target);
    }
  }

  visit(sourceDirectory);
}

const dutchRouteIndex = new Map(localizedRoutes.map(([internalRoute, dutchRoute]) => [internalRoute, dutchRoute]));
const englishRouteIndex = new Map(
  localizedRoutes.map(([internalRoute, , englishRoute]) => [internalRoute, `en/${englishRoute}`]),
);
copyStaticArtifacts("nl-BE", dutchRouteIndex);
copyStaticArtifacts("en-BE", englishRouteIndex);

function flattenLocaleArtifacts(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);

    if (entry.isDirectory() && entry.name === "__next.$d$locale") {
      function flatten(sourceDirectory, relativePath = "") {
        for (const nested of readdirSync(sourceDirectory, { withFileTypes: true })) {
          const nestedSource = join(sourceDirectory, nested.name);
          const nestedPath = relativePath ? `${relativePath}.${nested.name}` : nested.name;

          if (nested.isDirectory()) {
            flatten(nestedSource, nestedPath);
            continue;
          }

          copyFileSync(nestedSource, join(directory, `__next.$d$locale.${nestedPath}`));
        }
      }

      flatten(source);
      rmSync(source, { recursive: true, force: true });
      continue;
    }

    if (entry.isDirectory()) flattenLocaleArtifacts(source);
  }
}

flattenLocaleArtifacts(exportRoot);

rmSync(join(exportRoot, "nl-BE"), { recursive: true, force: true });
rmSync(join(exportRoot, "en-BE"), { recursive: true, force: true });
rmSync(join(exportRoot, "nl-BE.html"), { force: true });
rmSync(join(exportRoot, "en-BE.html"), { force: true });
rmSync(join(exportRoot, "nl-BE.txt"), { force: true });
rmSync(join(exportRoot, "en-BE.txt"), { force: true });

console.log("Prepared Firebase Hosting routes in out/.");
