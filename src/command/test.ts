import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

interface Options extends JsonObject {
    command: string;
    args: string[];
}

export default createBuilder(async ( options: Options, context: BuilderContext ): Promise<BuilderOutput> => {
    if(!isWdioInstalled()) {
        context.logger.error("Wdio not installed. Can not run command. Exiting.")
        context.reportStatus('Failed')
        return Promise.resolve({success: false})
    }

    if(options.devServerTarget) {
        const [project, target, configuration] = (options.devServerTarget as string).split(':');
        await context.scheduleTarget({project: project, 'target': target, configuration: configuration});
    }

    const Launcher = require('@wdio/cli').default;
    const wdio = new Launcher(options.configUrl, options.opts)

    return wdio.run().then((code: number) => {
        context.reportStatus(`Done.`);
        return { 'success': code === 0}
    }, (error: any) => {
        context.reportStatus(`Failed.`);
        context.logger.error('Launcher failed to start the test', error.stacktrace)
        return { 'success': false }
    })
});

function isWdioInstalled(): boolean {
    try {
        // @ts-ignore
        const Launcher = require('@wdio/cli').default;
        return true;
    } catch (err) {
        return false;
    }
}