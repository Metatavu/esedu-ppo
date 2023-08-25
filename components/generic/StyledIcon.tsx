import { Icon, Box } from 'native-base';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Component props
 */
interface Props {
    size: number;
    name: string;
    style: StyleProp<ViewStyle>
    color?: string;
};

/**
 * Styled icon component
 */
const StyledIcon = ({ size, name, style, color }: Props) => {
    return (
        <Box style={style}>
            <Icon
                size={size}
                name={name}
                color={ color }
            />
        </Box>
    );
};

export default StyledIcon;