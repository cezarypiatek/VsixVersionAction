import * as core from '@actions/core'
import * as fs from 'fs'
import * as xml2js from 'xml2js'


const MANIFEST_FILE = core.getInput('vsix-manifest-file')
const VERSION = core.getInput('version')

async function run(): Promise<void> {
  try {

    if (!fs.existsSync(MANIFEST_FILE)) {
      core.setFailed(`Manifest file '${MANIFEST_FILE}' does not exist`)
      return
    }

    fs.readFile(MANIFEST_FILE, "utf-8", (err: any, data: any) => {
      if (err) {
        throw err;
      }

      xml2js.parseString(data, (err: any, result: any) => {
        if (err) {
          throw err;
        }

        let identifyFound = false;  
        for(let metadataIndex in result.PackageManifest.Metadata)
        {
          if(result.PackageManifest.Metadata[metadataIndex].Identity)
          {
            identifyFound = true;
            result.PackageManifest.Metadata[metadataIndex].Identity[0]['$'].Version = VERSION;
          }
        }
        
        if(identifyFound == false)
        {
          core.setFailed(`Invalid manifest file format. Cannot find 'PackageManifest.Metadata.Identity.Version' element`);
        }

        const builder = new xml2js.Builder();
        const xml = builder.buildObject(result);

        fs.writeFile(MANIFEST_FILE, xml, (err) => {
          if (err) {
            throw err;
          }

          console.log(`Manifest file '${MANIFEST_FILE}' updated.`);
        });
      });
    });
  }
  catch (error) {
    core.setFailed(error.message)
  }
}

run()