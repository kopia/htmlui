import React from 'react';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import { stateProperty } from '.';

export function TimesOfDayList(component, name, props = {}) {
    function parseTimeOfDay(v) {
        var re = /(\d+):(\d+)/;

        const match = re.exec(v);
        if (match) {
            const h = parseInt(match[1]);
            const m = parseInt(match[2]);
            let valid = (h < 24 && m < 60);

            if (m < 10 && match[2].length === 1) {
                valid = false;
            }

            if (valid) {
                return { hour: h, min: m };
            }
        }

        return v;
    }

    function toMultilineString(v) {
        if (v) {
            let tmp = [];

            for (const tod of v) {
                if (typeof (tod) === "object") {
                    tmp.push(tod.hour + ":" + (tod.min < 10 ? "0" : "") + tod.min);
                } else {
                    tmp.push(tod);
                }
            }

            return tmp.join("\n");
        }

        return "";
    }

    function fromMultilineString(target) {
        const v = target.value;
        if (v === "") {
            return undefined;
        }

        let result = [];

        for (const line of v.split(/\n/)) {
            result.push(parseTimeOfDay(line));
        };

        return result;
    }

    return <FormGroup>
        <Form.Control
            size="sm"
            name={name}
            value={toMultilineString(stateProperty(component, name))}
            onChange={e => component.handleChange(e, fromMultilineString)}
            as="textarea"
            rows="5"
            {...props}>
        </Form.Control>
        <Form.Control.Feedback type="invalid">Invalid Times of Day</Form.Control.Feedback>
    </FormGroup>;
}
