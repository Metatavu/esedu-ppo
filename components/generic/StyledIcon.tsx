import { Icon, Box } from 'native-base';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Component props
 */
interface Props {
    size: number;
    name: string;
    style: StyleProp<ViewStyle>
};

/**
 * Styled icon component
 */
const StyledIcon = ({ size, name, style }: Props) => {
    return (
        <Box style={style}>
            <Icon
                size={size}
                name={name}
            />
        </Box>
    );
};

export default StyledIcon;