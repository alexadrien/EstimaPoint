import styled from 'styled-components';
import MUIButton from '@material-ui/core/Button';
import MUIAppBar from '@material-ui/core/AppBar';
import MUITypography from '@material-ui/core/Typography';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CalcResult = styled.div`
  display: flex;
  align-self: center;
  margin: 20px;
`;

export const Button = styled(MUIButton)`
  && {
    margin: auto auto;
  }
`;

export const PointButton = styled(MUIButton)`
  && {
    margin: 10px auto;
  }
`;

export const AppBar = styled(MUIAppBar)`
  && {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;