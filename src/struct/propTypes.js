import PropTypes from 'prop-types'

export default {
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  data: PropTypes.array,
  record: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  columnKey: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  render: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.func,
  ]),
  column: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
  ),
  dropTarget: PropTypes.arrayOf(
    PropTypes.shape({
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
  ),
  domEvent: PropTypes.shape({
    clientX: PropTypes.number.isRequired,
    clientY: PropTypes.number.isRequired,
    preventDefault: PropTypes.func.isRequired,
  }),
}
