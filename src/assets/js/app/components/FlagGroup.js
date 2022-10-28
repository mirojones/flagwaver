import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import {
    FlagpoleType,
    FlagGroupModule,
    buildAsyncFlagFromImage,
    buildAsyncFlagFromVideo,
    buildFlag,
    buildFlagpole
} from '../../flagwaver';
import withAppContext from '../hocs/withAppContext';
import { getObject } from '../utils/BlobUtils';

const DEFAULT_FLAG_IMAGE_PATH = `${process.env.ROOT_URL}/assets/img/flag-default.png`;

function FlagGroup({ app, options, addToast }) {
    const module = useRef();

    const updateFlag = (flag) => {
        app.remove(module.current);

        module.current = new FlagGroupModule({
            flagpole: buildFlagpole(options, flag),
            flag: flag
        });

        if (
            options.flagpoleType === FlagpoleType.HORIZONTAL ||
            options.flagpoleType === FlagpoleType.OUTRIGGER
        ) {
            const flagGroup = module.current.subject;
            const flagpole = flagGroup.flagpole;
            const poleLength = flagpole.constructor.defaults.poleLength;

            // Center top of flagpole
            flagGroup.object.position
                .set(0, poleLength, 0)
                .sub(flagpole.top);
        }

        app.add(module.current);
        app.render();
        app.needsUpdate = true;
    };

    const renderModule = () => {
        const { imageSrc } = options;

        const src = imageSrc || DEFAULT_FLAG_IMAGE_PATH;

        (new Promise((resolve, reject) => {
            const file = getObject(src);
            const isVideo = (file && file.type.match(/video\/.*/)) ||
                src.match(/\.(3gp|avi|flv|mov|mp4|mpg|ogg|webm|wmv)$/);

            if (isVideo) {
                const isBrowserIE11 = window.document.documentMode;

                if (isBrowserIE11) {
                    reject('Browser feature not supported.');
                } else {
                    buildAsyncFlagFromVideo(src, options)
                        .then((flag) => {
                            resolve(flag);
                        })
                        .catch((e) => {
                            reject('Video could not be loaded.');
                        });
                }
            } else {
                buildAsyncFlagFromImage(src, options)
                    .then((flag) => {
                        resolve(flag);
                    })
                    .catch((e) => {
                        reject('Image could not be loaded.');
                    });
            }
        }))
            .then((flag) => {
                updateFlag(flag);
            })
            .catch((error) => {
                updateFlag(buildFlag(options));

                addToast({
                    status: 'error',
                    message: error
                });
            });
    };

    useEffect(() => {
        module.current = new FlagGroupModule();

        app.add(module.current);
        app.needsUpdate = true;

        renderModule();

        return () => {
            app.remove(module.current);
        };
    }, []);

    useEffect(() => {
        renderModule();
    }, [options]);

    return null;
}

FlagGroup.propTypes = {
    app: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    addToast: PropTypes.func.isRequired
};

export default withAppContext(FlagGroup);
